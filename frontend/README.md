# ResQ client

React Native Expo app. The home feed reads from the MySQL API; the app does not bundle hardcoded meal listings.

```sh
npm install
npm run dev
```

Open in Expo Go or press `a` to use an Android emulator. By default, web uses `http://localhost:4000` and Android emulators use `http://10.0.2.2:4000`. For a physical phone, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the computer's reachable LAN address.

The Explore tab includes category browsing, live search results, and locally saved search history. The Drop Alert Center stores global notification preferences and shop subscriptions through the backend API. The drawer also includes the 0đ Sharing Corner, Budget Mystery Bags, 0đ Sharing Station Map, and Shop Detail screens. These screens load active food listings and shop details from the backend API. Free listings use a zero current price; discounted listings use a current price below the original price. Photos are served from each listing's `image_url`.
