const CACHE_NAME = "andys-cache-v1";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/grafic.html",
    "/smena.html",
    "/styles/main.css",
    "/styles/styles1.css",
    "/scripts/app.js",
    "/scripts/sw.js",
    "/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("📦 Кэширование ресурсов");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("🧹 Очистка старого кеша:", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});
