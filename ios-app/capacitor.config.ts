import type { CapacitorConfig } from '@capacitor/cli';

// Tokutei Kensetsu — Capacitor wrap of the GitHub Pages web app.
// Decisions locked with anh:
// - Bundle ID: com.donghung.tokuteikensetsu (registering in Apple Developer tonight)
// - Premium inside the native build = App Store IAP ONLY (premium.html already
//   hides the VietQR flow under Capacitor); web keeps VietQR.
// - Premium state lives on the account: users/{uid}.isPremium + premiumUntil
//   (null = lifetime) — the IAP backend path must write the same two fields.
const config: CapacitorConfig = {
  appId: 'com.donghung.tokuteikensetsu',
  appName: 'Tokutei Kensetsu',
  webDir: 'www',
};

export default config;
