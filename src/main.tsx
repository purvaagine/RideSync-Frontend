import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);

const googleMapsAPIKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (googleMapsAPIKey) {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsAPIKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
} else {
  console.error('Google Maps API key is missing!');
}

root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
