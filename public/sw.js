// public/sw.js

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || "Class Reminder";
  const options = {
    body: data.body || "You have a class starting soon.",
    icon: "/icon-192.png",      // optional, if you have an icon
    badge: "/icon-192.png",     // optional
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if one is already open
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open the app
      if (clients.openWindow) {
        return clients.openWindow("/routine");
      }
    })
  );
});
