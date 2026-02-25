// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles.css";
import { Provider } from "react-redux";
import { store } from "./store";
// 👇 Уберите BrowserRouter отсюда — он в App.tsx

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>  {/* 👈 Provider открыт */}
      <App />  {/* 👈 App рендерится внутри Provider */}
    </Provider>  {/* 👈 Provider закрыт */}
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/galaxy_distance_frontend/sw.js")  // 👈 Путь с base!
      .then((_res) => console.log("✅ Service worker registered"))
      .catch((err) => console.log("❌ Service worker not registered", err));
  });
}