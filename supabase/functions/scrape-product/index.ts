import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function scrapeProduct(url: string) {
  try {
    console.log('Fetching URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML fetched, length:', html.length);

    // Extract title using multiple methods
    let title = '';
    const titlePatterns = [
      /<title[^>]*>([^<]+)<\/title>/i,
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
      /<h1[^>]*>([^<]+)<\/h1>/i
    ];

    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        break;
      }
    }

    // Extract image using multiple methods
    let imageUrl = '';
    const imagePatterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /<img[^>]*src=["']([^"']+)["'][^>]*class[^>]*product/i,
      /<img[^>]*class[^>]*product[^>]*src=["']([^"']+)["']/i
    ];

    for (const pattern of imagePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        imageUrl = match[1].trim();
        // Make sure it's a full URL
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
        }
        break;
      }
    }

    // Extract description
    let description = '';
    const descPatterns = [
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
    ];

    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        description = match[1].trim();
        break;
      }
    }

    console.log('Extracted data:', { title, imageUrl, description });

    return {
      title: title || 'Produktanbefaling',
      imageUrl: imageUrl || null,
      description: description || null
    };

  } catch (error) {
    console.error('Error scraping product:', error);
    return {
      title: 'Produktanbefaling',
      imageUrl: null,
      description: null
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const productData = await scrapeProduct(url);

    return new Response(
      JSON.stringify(productData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to scrape product data',
        title: 'Produktanbefaling',
        imageUrl: null,
        description: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})