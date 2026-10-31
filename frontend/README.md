# ResQ client

React Native Expo app. The home feed reads from the MySQL API; the app does not bundle hardcoded meal listings.

```sh
npm install
npm run dev
```

Open in Expo Go or press `a` to use an Android emulator. By default, web uses `http://localhost:4000` and Android emulators use `http://10.0.2.2:4000`. For a physical phone, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the computer's reachable LAN address.

The Explore tab includes category browsing, live search results, saved-food controls, locally saved search history, and Search Settings. The Saved tab switches between saved food and shops; food favorites and shops are stored by the backend. Search-alert setup supports food keywords, saved-shop targets, radius, discount/free-food preferences, and a time window. The My Drop Alert feed shows active listings matched to enabled shop or keyword alerts. Alert settings can be managed separately in the Drop Alert Center. Shop Detail links to verified-order Shop Reviews. The drawer also includes the 0đ Sharing Corner, Budget Mystery Bags and Guide, 0đ Sharing Station Map, and Rescue Hotspots.

Search sort priority and history preferences are applied locally. Shop coordinates are not enough to determine a buyer's distance, and the backend does not currently have parking metadata or scheduled-drop events; accordingly, distance, free-parking, and upcoming-drop filters cannot be applied to listings yet. Search-alert discount/time options are stored as preferences but do not trigger background notifications; push delivery is not configured. Free listings use a zero current price; discounted listings use a current price below the original price. Photos are served from each listing's `image_url`.

The Maps tab groups active backend listings by shop and provides food-type, parking-preference, and pickup-time filter views. Parking preferences are saved on the device; they do not filter shops because the backend has no parking metadata. Selecting a shop opens its live food list, where reservations use the existing backend endpoint. Hotspot counts are derived from active backend listings. The map is an in-app illustration positioned from shop coordinates; device location, geospatial search, and push-notification delivery are not currently configured.
