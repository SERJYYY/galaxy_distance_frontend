// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { GalaxiesPage } from "./pages/GalaxiesPage";
import { GalaxyDetailPage } from "./pages/GalaxyDetailPage";
import "./styles.css";

// 👇 Импорт из target_config
import { dest_root } from "./utils/target_config";

function App() {
  return (
    // 👇 basename теперь из config
    <BrowserRouter basename={dest_root}>
      <div className="app">
        <Navbar />
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