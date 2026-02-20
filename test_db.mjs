import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

const supabase = createClient(
    'https://vlszyfcydvwvejrulqws.supabase.co',
    'sb_publishable_YEAFzD3qDPmDbJT6w-zwJQ__jVo2RrZ'
);

// Note: This script needs the service role key or a valid session to work if RLS is on, 
// but RLS is off for sessions according to my earlier check.

async function test() {
    const sessionId = 'd9a6cfe8-f21d-422d-b850-4ef6614c610f';
    console.log('Testing session:', sessionId);

    const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    console.log('Session audio_url:', session.audio_url);
}

test();
