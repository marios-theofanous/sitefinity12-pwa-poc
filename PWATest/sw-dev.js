/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js")

const FALLBACK_URL = "Content/Precache/offline.html"

// This needs to be an empty list so that the injectManifest command of workbox can inject all the necessary references.
workbox.precaching.precacheAndRoute([])


//Register an image cache with 30 days expiry date and maximum 50 items
workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif)\?.+$/,
    new workbox.strategies.CacheFirst({
        cacheName: 'image-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            })

        ]
    })
)

// Caching all the js files
workbox.routing.registerRoute(
    new RegExp('.*\.js'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'js-cache'
    })
)

// Caching all the axd files
workbox.routing.registerRoute(
    new RegExp('.*\.axd?.+'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'axd-cache'
    })
)

// Caching all the guides pages for 24 hours and up to a max of 60 guides at a time
workbox.routing.registerRoute(
    /\/guides\/*(.*)/g,
    new workbox.strategies.CacheFirst({
        cacheName: 'guides-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 60,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
            }),
        ],
    })
)

// Exclude Sitefinity backend from caching
workbox.routing.registerRoute(
    new RegExp("/Sitefinity/?.*", "i"),
    new workbox.strategies.NetworkOnly()
)

// For everything without a specific handler use a network first approach reverting back to a cache if needed.
workbox.routing.setDefaultHandler(
    new workbox.strategies.NetworkFirst({
        cacheName: 'general-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
            }),
        ],
    })
)

// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
workbox.routing.setCatchHandler(() => {
    // The FALLBACK_URL entries must be added to the cache ahead of time, either via runtime
    // or precaching.
    // If they are precached, then call workbox.precaching.getCacheKeyForURL(FALLBACK_URL)
    // to get the correct cache key to pass in to caches.match().
    //
    // Use event, request, and url to figure out how to respond.
    // One approach would be to use request.destination, see
    // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
    const cacheMatchKey = workbox.precaching.getCacheKeyForURL(FALLBACK_URL);
    console.log("CATCH HANDLER IN ACTION");
    return caches.match(cacheMatchKey);
})



// Testing of push notifications and how they would look. Can try it through chrome's developer tools. 
// Needs notification permission!
self.addEventListener('push', function (e) {
    let {title, body} = JSON.parse(e.data.text())
    var options = {
        body,
        icon: 'images/example.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore', title: 'Explore this new world',
                icon: 'images/checkmark.png'
            },
            {
                action: 'close', title: 'Close',
                icon: 'images/xmark.png'
            },
        ]
    };

    e.waitUntil(
        self.registration.showNotification(title, options)
    );
});