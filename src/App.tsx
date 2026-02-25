// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { GalaxiesPage } from "./pages/GalaxiesPage";
import { GalaxyDetailPage } from "./pages/GalaxyDetailPage";
import "./styles.css";

function App() {
  return (
    <BrowserRouter basename="/galaxy_distance_frontend">  {/* 👈 basename для GitHub Pages */}
      <div className="app">
        <Navbar />
        {/* 👇 Routes — обязательная обёртка */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/galaxies" element={<GalaxiesPage />} />
          <Route path="/galaxies/:id" element={<GalaxyDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;