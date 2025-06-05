// Firebase messaging service worker with your VAPID key
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

// Declare Firebase variable
const firebase = self.firebase

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBRgsiqNxAUWHn-fZgGRDySkwf-_tkf1W8",
  authDomain: "parking-angel-224eb.firebaseapp.com",
  projectId: "parking-angel-224eb",
  storageBucket: "parking-angel-224eb.firebasestorage.app",
  messagingSenderId: "74167164461",
  appId: "1:74167164461:web:9d24ad91f8ca36cb18e2a4",
})

// Retrieve Firebase Messaging object
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload)

  const notificationTitle = payload.notification?.title || "Parking Angel"
  const notificationOptions = {
    body: payload.notification?.body || "You have a new parking update",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "parking-angel-notification",
    data: payload.data,
    actions: [
      {
        action: "view",
        title: "View Details",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received.")

  event.notification.close()

  if (event.action === "view") {
    // Open the app to dashboard
    event.waitUntil(clients.openWindow("/dashboard"))
  } else if (event.action === "dismiss") {
    // Just close the notification
    return
  } else {
    // Default action - open dashboard
    event.waitUntil(clients.openWindow("/dashboard"))
  }
})
