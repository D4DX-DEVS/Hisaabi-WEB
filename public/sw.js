// Minimal service worker: makes the site installable and lets prayer reminders show as system notifications.
// Network-first for pages so users always get the latest deploy; static assets fall back to cache when offline.
const CACHE = "hisaabi-static-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
));

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin || r.url.includes("/api/")) return;
  e.respondWith(
    fetch(r).then((res) => {
      if (res.ok && /\/(_next\/static|icons|img|fonts)\//.test(r.url)) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(r, c)); }
      return res;
    }).catch(() => caches.match(r).then((m) => m || Response.error())),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow("/prayer"))));
});
