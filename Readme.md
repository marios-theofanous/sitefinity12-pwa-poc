# Sitefinity 12 PWA proof of concept

## What are PWAs?
Progressive Web Apps provide an installable, app-like experience on desktop and mobile that are built and delivered directly via the web. They're web apps that are fast and reliable. And most importantly, they're web apps that work in any browser. If you're building a web app today, you're already on the path towards building a Progressive Web App.

More can be found here: https://developers.google.com/web/progressive-web-apps/

This proof of concept focuses more on using service workers for caching pages and resources for offline use but it should provide a good starting point for anyone wanting to create a PWA using Sitefinity 12. Due to the nature of content management systems some restrictions apply when trying to use the application offline as well as how the transitions between pages happen (page reload vs content change).

## Why use a service worker for caching?
Caching is a great way to improve loading times and the overall feel of a web app. A benefit of using service workers for caching, compared to cache headers, is that modern browsers allow the use of those resources while offline. Using a framework for caching, such as Workbox (https://developers.google.com/web/tools/workbox/), allows better control of the strategies employed when caching instead of relying only on time caches. This allows us to use caching on more dynamic data. 

For example notifications on a webpage could be fetched using a _NetworkFirst_ approach which allows us to fetch the latest notifications and display them to the user while saving a copy of that data in the cache. In the event that the user is offline or the server is not accessible the information from the cache will be used to display the notifications without the user ever knowing there was an issue. For more caching strategies using Workbox check https://developers.google.com/web/tools/workbox/guides/common-recipes

## How is caching used on this project?
This project uses a combination of precaching (https://developers.google.com/web/tools/workbox/guides/precache-files/) and dynamic caching.

### What is precaching?
Precaching, as the name implies, allows the caching of resources before the service worker is installed. These files are cached until a new version of the service worker is published that specifies a new revision for a file. This is meant to be an automated process that is run during the deployment pipeline to ensure that precached files are always up to date and that the end-user is not being served stale resources. 

This project precaches any HTML files in the `Content/Precache` folder. The glob patterns for what files are cached can be found in the `workbox-options.js` file. Precaching takes the `sw-dev.js` file and injects the references along with a revision number that is generated automatically for each file. When a resource is altered a new revision number is assigned and therefore the new version of the resource is precached.

#### How do I inject precache references and generate the sw-prod.js file?
The node package manager (NPM) needs to be installed on your computer. After that install the workbox-cli by running `npm install workbox-cli --global`

Next run ` workbox injectManifest workbox-options.js` This will take the `sw-dev.js` file and inject the precache references. The `sw-dev.js` **needs** to have the following line in it so that the injector knows where to inject the references. 

`workbox.precaching.precacheAndRoute([]);`

There is a wizard available that will generate the `workbox-options.js` file. To start it run: `workbox wizard --injectManifest`

#### How do I load precached resources?
Because precaching utilises the revision number to refresh the cache we cannot just request the cached resource using `cache.match(PRECACHED_URL)`. Instead, to fetch a precached version of a resource use `workbox.precaching.getCacheKeyForURL(PRECACHED_URL);`  
 
### What are the available caching strategies?
There are multiple caching strategies that Workbox provides as well as plugins that allow more fine control over each caching strategy. There is also the option for custom plugins. Below are the caching strategies available for Workbox taken from: https://developers.google.com/web/tools/workbox/guides/route-requests

#### Stale While Revalidate
This strategy will use a cached response for a request if it is available and update the cache in the background with a response form the network. (If it’s not cached it will wait for the network response and use that). This is a fairly safe strategy as it means users are regularly updating their cache. The downside of this strategy is that it’s always requesting an asset from the network, using up the user’s bandwidth.

#### Network First
This will try and get a request from the network first. If it receives a response, it’ll pass that to the browser and also save it to a cache. If the network request fails, the last cached response will be used.

#### Cache First
This strategy will check the cache for a response first and use that if one is available. If the request isn’t in the cache, the network will be used and any valid response will be added to the cache before being passed to the browser.

#### Network Only
Force the response to come from the network.

#### Cache Only
Force the response to come from the cache.

The service worker file for this project employs a mix of the strategies found above along with the most common plugins to create caches that provides a good balance between offline functionality, speed, and fresh data.

## How is the service worker loaded as part of a CMS?
There is a Sitefinity widget that registers the service worker whenever it is on a page. The widget takes no space on the page as it is only running a JavaScript script tha tries to register the service worker if the functionality is available on the browser. If service workers are unavailable the caching/offline functionality will be disabled. It is recommended that this widget is added to the bottom of a page template so that the service worker is registered or updated fast and at all times.

Service workers will run in the background even if the page that registers them is accessed only once. The recommendation comes as a way to make sure that service worker updates are delivered as fast as possible to the end users. 

Depending on the functionality (e.g. notifications) service workers could run in the background after the browser tab is closed.

