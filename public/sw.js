self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "BP Tracker Reminder";
  const options = {
    body: data.body || "Time to take your blood pressure reading.",
    icon: data.icon || "/android-chrome-192x192.png",
    badge: data.badge || "/android-chrome-192x192.png",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((tabs) => {
      for (const tab of tabs) {
        if (tab.url.includes(url) && "focus" in tab) {
          return tab.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
      return null;
    })
  );
});
