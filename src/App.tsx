import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { GalaxiesPage } from "./pages/GalaxiesPage";
import { GalaxyDetailPage } from "./pages/GalaxyDetailPage";

function App() {
    return (
        <Router>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/galaxies" element={<GalaxiesPage />} />
                    <Route path="/galaxies/:id" element={<GalaxyDetailPage />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
