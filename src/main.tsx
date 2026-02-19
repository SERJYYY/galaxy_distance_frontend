import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// 👇 main.tsx — это точка входа, здесь НЕ нужны хуки Redux!
// Все проверки авторизации делай в App.tsx или отдельном компоненте

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App /> {/* 👈 Обязательно рендерим App! */}
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);