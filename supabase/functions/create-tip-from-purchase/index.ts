import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      user_id,
      product_url,
      product_name,
      product_image,
      product_price,
      comment,
      category,
      visibility = 'friends'
    } = await req.json()

    // Validate required fields
    if (!user_id || !product_url) {
      throw new Error('user_id and product_url are required')
    }

    // Create a Supabase client with service role for server-side operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // If product info is not provided, try to fetch it
    let finalProductName = product_name
    let finalProductImage = product_image
    let finalProductPrice = product_price

    if (!product_name || !product_image) {
      try {
        const { data: productInfo } = await supabaseClient.functions.invoke('fetch-product-info', {
          body: { url: product_url }
        })

        if (productInfo) {
          finalProductName = finalProductName || productInfo.title
          finalProductImage = finalProductImage || productInfo.image_url
          finalProductPrice = finalProductPrice || productInfo.product_price
        }
      } catch (error) {
        console.log('Could not fetch product info:', error.message)
        // Continue without product info if fetch fails
      }
    }

    // Create the tip
    const { data: tipData, error: tipError } = await supabaseClient
      .from('tips')
      .insert({
        user_id,
        title: finalProductName || 'Produktanbefaling',
        description: comment || 'Anbefaling fra kjøp',
        product_name: finalProductName,
        product_url,
        product_price: finalProductPrice,
        image_url: finalProductImage,
        category,
        visibility,
        is_purchased: true
      })
      .select()
      .single()

    if (tipError) {
      throw new Error(`Failed to create tip: ${tipError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        tip: tipData,
        message: 'Tip created successfully from purchase data'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('Error creating tip from purchase:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})