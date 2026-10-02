import { request, safeError } from "./util.mjs"

export function payload(event, c) {
  const mention =
    event.severity === "critical" || event.severity === "error"
      ? c.mention || ""
      : ""
  const users = [...mention.matchAll(/<@!?(\d+)>/g)].map((x) => x[1])
  const roles = [...mention.matchAll(/<@&(\d+)>/g)].map((x) => x[1])
  return {
    content: mention || undefined,
    allowed_mentions: {
      parse: /^@(?:here|everyone)$/.test(mention) ? ["everyone"] : [],
      users,
      roles,
    },
    embeds: [
      {
        title: `Hydration UI · ${event.kind}`.slice(0, 256),
        url: c.target,
        color:
          event.severity === "critical"
            ? 0xe74c3c
            : event.severity === "error"
              ? 0xe67e22
              : 0x3498db,
        description: String(
          event.data.summary || event.data.state || event.kind,
        ).slice(0, 1500),
        fields: [
          ...(event.data.observer
            ? [{ name: "Observer", value: event.data.observer }]
            : []),
          ...(event.data.observers
            ? [
                {
                  name: "Network observers",
                  value:
                    event.data.observers
                      .map(
                        (o) =>
                          `${o.id}: ${o.state} (${o.exitIp || "exit pending"})`,
                      )
                      .join("\n")
                      .slice(0, 1024) || "pending",
                },
              ]
            : []),
          ...(event.data.sha
            ? [
                {
                  name: "Source",
                  value: `[${event.data.sha.slice(0, 12)}](https://github.com/${c.repo}/commit/${event.data.sha})`,
                },
              ]
            : []),
          ...(event.data.changelog
            ? [
                {
                  name: "Changes",
                  value:
                    `[Compare commits](${event.data.changelog.url})\n${event.data.changelog.commits
                      .slice(0, 6)
                      .map(
                        (x) =>
                          `${x.sha.slice(0, 8)} ${x.message.replace(/[@`<>]/g, "")}`,
                      )
                      .join("\n")}`.slice(0, 1024),
                },
              ]
            : []),
          ...(event.data.paths
            ? [
                {
                  name: "Changed paths",
                  value:
                    event.data.paths.slice(0, 12).join("\n").slice(0, 1024) ||
                    "—",
                },
              ]
            : []),
        ],
        footer: { text: `Watchdog event ${event.id}` },
        timestamp: event.at,
      },
    ],
  }
}

export async function deliver(store, c) {
  if (!c.webhook) return
  for (const event of store.pending()) {
    try {
      const url = new URL(c.webhook)
      url.searchParams.set("wait", "true")
      const r = await request(url, {
        method: "POST",
        timeoutMs: c.timeoutMs,
        maxBytes: 65536,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload(event, c)),
      })
      if (r.status >= 200 && r.status < 300) {
        store.delivered(event.id)
        continue
      }
      let delay = 0
      if (r.status === 429) {
        try {
          delay = Number(JSON.parse(r.bytes).retry_after) * 1000
        } catch {
          /* use bounded backoff */
        }
      }
      const backoff = Math.min(
        3600000,
        10000 * 2 ** Math.min(event.attempts, 8),
      )
      store.retry(
        event.id,
        Date.now() + Math.max(backoff, Math.min(delay || 0, 3600000)),
        `Discord HTTP ${r.status}`,
      )
      break
    } catch (error) {
      store.retry(
        event.id,
        Date.now() +
          Math.min(3600000, 10000 * 2 ** Math.min(event.attempts, 8)),
        safeError(error),
      )
      break
    }
  }
}
