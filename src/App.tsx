// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { GalaxiesPage } from "./pages/GalaxiesPage";
import { GalaxyDetailPage } from "./pages/GalaxyDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ModeratorPage } from "./pages/ModeratorPage";
import { RequestsPage } from "./pages/RequestsPage";
import { RequestDetailPage } from "./pages/RequestDetailPage";
import { CartPage } from "./pages/CartPage";
import { GalaxyDetailModeratorPage } from "./pages/GalaxyDetailModeratorPage";
import { GalaxyCreatePage } from "./pages/GalaxyCreatePage";
import { GalaxyVibesPage } from "./pages/GalaxyVibesPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/galaxies" element={<GalaxiesPage />} />
        <Route path="/galaxies/create" element={<GalaxyCreatePage />} />
        <Route path="/galaxies/:id" element={<GalaxyDetailPage />} />
        <Route path="/galaxy-vibes/:id" element={<GalaxyVibesPage />} />
        <Route path="/galaxies/:id/edit" element={<GalaxyDetailModeratorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/moderator" element={<ModeratorPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="*" element={<div className="container py-5">404</div>} />
      </Routes>
    </>
  );
}

export default App;