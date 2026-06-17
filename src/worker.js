const SUPA_URL = 'https://bhjiqlnyomdvugdsafbz.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoamlxbG55b21kdnVnZHNhZmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDc5NjUsImV4cCI6MjA4OTc4Mzk2NX0.OqjnvqGRtw_nV7TgEEBWviHNn4XHXaVM7BHMkjvpXUk';

export default {
  async fetch(request, env) {
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
