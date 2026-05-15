// ============================================================
//  BITGAMESO — supabase-client.js
//  Cliente compartido de Supabase (importado por todos los JS)
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'https://pvugnjnnfyvkfqhnecpz.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_i8guONbRc21Ska2Jy6VA-A_pV19OyiM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);