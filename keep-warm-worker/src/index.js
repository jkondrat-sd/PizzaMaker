// Keeps the PizzaMaker backend warm on Render's free tier, which suspends the
// service after ~15 min idle — the next real visitor then eats a cold start
// that can run well past a minute (measured 127s once, 0.86s warm). This pings
// the backend's own health endpoint often enough that it never gets the
// chance to sleep.
//
// This replaced a GitHub Actions cron doing the same job. GitHub's scheduler
// is best-effort: it was configured for every 12 minutes but its actual run
// history showed gaps of 2-5 hours, so the backend was sleeping almost all the
// time regardless. Cloudflare Cron Triggers run on schedule.

const HEALTH_URL = 'https://pizzamaker-api.onrender.com/actuator/health';

// Render's own cold start can run well past a minute — give it real room
// rather than giving up early and leaving the backend to fall back asleep
// before it even finished waking up.
const PING_TIMEOUT_MS = 150000;

async function ping() {
  const startedAt = Date.now();
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(PING_TIMEOUT_MS) });
    const ms = Date.now() - startedAt;
    console.log(`ping: ${res.status} in ${ms}ms`);
    return { ok: res.ok, status: res.status, ms };
  } catch (err) {
    const ms = Date.now() - startedAt;
    console.log(`ping failed after ${ms}ms: ${err.message}`);
    return { ok: false, error: err.message, ms };
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ping());
  },
  // A plain GET on the Worker's own URL triggers a ping on demand — useful for
  // checking it's wired up correctly without waiting for the next cron tick.
  async fetch() {
    const result = await ping();
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 502,
      headers: { 'content-type': 'application/json' },
    });
  },
};
