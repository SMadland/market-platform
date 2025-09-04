import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch all user data
    const [
      { data: profile },
      { data: tips },
      { data: friendships },
      { data: likes },
      { data: comments },
      { data: conversations },
      { data: messages },
      { data: notifications },
      { data: gdprConsent }
    ] = await Promise.all([
      supabaseClient.from('profiles').select('*').eq('user_id', user_id).single(),
      supabaseClient.from('tips').select('*').eq('user_id', user_id),
      supabaseClient.from('friendships').select('*').or(`requester_id.eq.${user_id},addressee_id.eq.${user_id}`),
      supabaseClient.from('likes').select('*').eq('user_id', user_id),
      supabaseClient.from('comments').select('*').eq('user_id', user_id),
      supabaseClient.from('conversations').select('*').or(`participant1_id.eq.${user_id},participant2_id.eq.${user_id}`),
      supabaseClient.from('conversation_messages').select('*').eq('user_id', user_id),
      supabaseClient.from('notifications').select('*').eq('user_id', user_id),
      supabaseClient.from('gdpr_consents').select('*').eq('user_id', user_id).single()
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      user_id,
      profile,
      tips: tips || [],
      friendships: friendships || [],
      likes: likes || [],
      comments: comments || [],
      conversations: conversations || [],
      messages: messages || [],
      notifications: notifications || [],
      gdpr_consent: gdprConsent
    };

    return new Response(
      JSON.stringify(exportData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to export user data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})