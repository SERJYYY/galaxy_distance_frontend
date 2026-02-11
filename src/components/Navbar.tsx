import React from "react";
import { Link } from "react-router-dom";
import homeIcon from "../assets/home.png";

export const Navbar: React.FC = () => {
    return (
        <header className="top-bar">
            <Link to="/" className="home-button" aria-label="Главная">
                <img className="home-icon" src={homeIcon} alt="Главная" />
            </Link>
            <nav>
                <Link to="/galaxies" style={{ color: "white", marginLeft: 20 }}>Список галактик</Link>
            </nav>
        </header>
    );
};
