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
    const { url } = await req.json()

    if (!url) {
      throw new Error('URL is required')
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MamonBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const html = await response.text()

    // Extract title using regex (simple approach)
    let title = 'Produktanbefaling'
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim()
      // Remove common suffixes
      title = title.replace(/\s*[-–|]\s*.+$/, '').trim()
    }

    // Extract image - look for og:image meta tag first
    let imageUrl = null
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
    if (ogImageMatch && ogImageMatch[1]) {
      imageUrl = ogImageMatch[1]
    } else {
      // Look for twitter:image as fallback
      const twitterImageMatch = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i)
      if (twitterImageMatch && twitterImageMatch[1]) {
        imageUrl = twitterImageMatch[1]
      }
    }

    // Extract price (basic attempt)
    let price = null
    const pricePatterns = [
      /kr\s*(\d+(?:[.,]\d{2})?)/gi,
      /(\d+(?:[.,]\d{2})?)\s*kr/gi,
      /NOK\s*(\d+(?:[.,]\d{2})?)/gi,
      /(\d+(?:[.,]\d{2})?)\s*NOK/gi
    ]

    for (const pattern of pricePatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        const priceStr = match[1].replace(',', '.')
        const parsedPrice = parseFloat(priceStr)
        if (!isNaN(parsedPrice)) {
          price = parsedPrice
          break
        }
      }
    }

    // Extract description from og:description
    let description = null
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i)
    if (ogDescMatch && ogDescMatch[1]) {
      description = ogDescMatch[1].trim()
    }

    return new Response(
      JSON.stringify({
        title,
        image_url: imageUrl,
        product_price: price,
        description,
        original_url: url
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('Error fetching product info:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        title: 'Produktanbefaling',
        image_url: null,
        product_price: null,
        description: null
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})