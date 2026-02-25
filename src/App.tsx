// src/App.tsx
import { Routes, Route } from "react-router-dom";  // 👈 BrowserRouter НЕ нужен здесь
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { GalaxiesPage } from "./pages/GalaxiesPage";
import { GalaxyDetailPage } from "./pages/GalaxyDetailPage";
import "./styles.css";

function App() {
  return (
    <div className="app">
      <Navbar />
      {/* 👇 Routes — обязательная обёртка для <Route> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/galaxies" element={<GalaxiesPage />} />
        <Route path="/galaxies/:id" element={<GalaxyDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;