# pizzamaker-keep-warm

A Cloudflare Worker that pings the PizzaMaker backend's health endpoint every
5 minutes so Render's free tier never gets the 15 minutes of idle it needs to
suspend the service. Replaces a GitHub Actions cron that was supposed to do
the same job every 12 minutes but, per its own run history, was actually
firing every 2-5 hours — GitHub's scheduler is best-effort and silently
throttles frequent cron schedules on low-activity repos. Cloudflare Cron
Triggers run on schedule.

## Deploy

One-time setup, from this directory:

```
cd keep-warm-worker
npx wrangler login
npx wrangler deploy
```

That's it — no `wrangler.toml` values need editing, no secrets, no bindings.
The cron trigger is defined in `wrangler.toml` and activates automatically on
deploy. Cloudflare's dashboard (Workers & Pages → pizzamaker-keep-warm) shows
trigger history and each run's logs.

## Verify

- **On demand**: the deployed Worker also responds to a plain GET, so you can
  trigger a ping by hand and see the result immediately:
  ```
  curl https://pizzamaker-keep-warm.<your-subdomain>.workers.dev
  ```
  Returns `{"ok":true,"status":200,"ms":842}` on a warm hit, or a slower `ms`
  the first time it wakes a sleeping backend.
- **On schedule**: Cloudflare dashboard → the Worker → Triggers tab shows the
  next scheduled run and past run logs (status, duration).

## Updating

Edit `src/index.js` or `wrangler.toml`, then `npx wrangler deploy` again from
this directory. No separate teardown step — a deploy replaces the previous
version and its cron trigger in place.
