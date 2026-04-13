// src/APi/endpoints.js

export const ENDPOINTS = {
  LOGIN: "/users/auth/login/",
  SIGNUP: "/users/auth/signup/",
  ME: "/users/me/",
  VERIFY_PASSWORD: "/users/me/verify-password/",
  TRIPS: "/users/trips/",
  WALLET: "/payment/wallet/",
  WALLET_RECHARGE: "/payment/wallet/recharge/",
  VEHICLE: (id) => `/vehicles/${id}/`,
};