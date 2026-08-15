const SUPA_URL = 'https://bhjiqlnyomdvugdsafbz.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoamlxbG55b21kdnVnZHNhZmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDc5NjUsImV4cCI6MjA4OTc4Mzk2NX0.OqjnvqGRtw_nV7TgEEBWviHNn4XHXaVM7BHMkjvpXUk';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/chat') {
      const body = await request.text();
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: body
      });
      return new Response(resp.body, {
        status: resp.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env) {
    const url = `${SUPA_URL}/rest/v1/user_data?select=id&limit=1`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          Accept: 'application/json'
        }
      });
      if (!res.ok) {
        console.error('Supabase cron ping failed', res.status, await res.text());
      }
    } catch (error) {
      console.error('Supabase cron ping error', error);
    }
  }
};
