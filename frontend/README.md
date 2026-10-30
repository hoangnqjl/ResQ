# ResQ client

React Native Expo app. The home feed reads from the MySQL API; the app does not bundle hardcoded meal listings.

```sh
npm install
npm run dev
```

Open in Expo Go or press `a` to use an Android emulator. By default, web uses `http://localhost:4000` and Android emulators use `http://10.0.2.2:4000`. For a physical phone, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to the computer's reachable LAN address.
