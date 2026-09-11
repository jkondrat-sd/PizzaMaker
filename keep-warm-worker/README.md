# pizzamaker-keep-warm

A Cloudflare Worker that pings the PizzaMaker backend's health endpoint every
3 minutes so Render's free tier never gets the 15 minutes of idle it needs to
suspend the service. Warm, the backend answers in under a second; cold, it has
been measured taking over three minutes to wake — long enough that Cloudflare's
own edge, which fronts Render's domain, gives up first and returns a 524 before
the container finishes booting. Keeping it awake avoids that entirely.

Replaces a GitHub Actions cron that was supposed to do the same job every 12
minutes but, per its own run history, was actually firing every 2-5 hours —
GitHub silently throttles frequent cron schedules on low-activity repos.
Cloudflare Cron Triggers run on schedule.

## Deploy

From this directory:

```
npx wrangler@3 login
npx wrangler@3 deploy
```

Pinned to Wrangler 3 because Wrangler 4 requires Node 22 and this machine runs
Node 18. Nothing in `wrangler.toml` needs editing — no secrets, no bindings.
The cron trigger activates automatically on deploy.

## Verify

The Worker has **no public URL** (`workers_dev = false`) — it doesn't need to
be reachable from the internet, and a workers.dev route would publish it on the
account's personal subdomain. Check it two ways instead:

- **Live logs**: `npx wrangler@3 tail pizzamaker-keep-warm` — prints each ping's
  status and duration as the cron fires.
- **Dashboard**: Cloudflare → Workers & Pages → pizzamaker-keep-warm →
  Triggers shows the schedule and recent run history.

To check the backend's own state directly, independent of this Worker:

```
curl -w "\n%{time_total}s\n" https://pizzamaker-api.onrender.com/actuator/health
```

Under a second means warm. A long hang means it had gone cold and something is
wrong with the pinging.

## Second, independent pinger

This Worker is the primary, but it's a single point of failure — if the Worker
is paused or Cloudflare has an incident, the backend goes cold. A free external
uptime monitor (cron-job.org, UptimeRobot) pointed at the same health URL every
5 minutes gives redundancy on a different provider, so both have to fail before
a visitor eats a cold start. See the repo's deployment notes.

## Updating

Edit `src/index.js` or `wrangler.toml`, then `npx wrangler@3 deploy` again from
this directory. A deploy replaces the previous version and its cron trigger in
place.
