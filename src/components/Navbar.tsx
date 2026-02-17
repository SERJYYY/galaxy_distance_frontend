import React from "react";
import { Link, useLocation } from "react-router-dom";
import homeIcon from "../assets/home.png";
import "../styles.css"; // стили для кнопки "Список галактик"

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="top-bar">
      <Link to="/" className="home-button" aria-label="Главная">
        <img className="home-icon" src={homeIcon} alt="Главная" />
      </Link>
      <nav>
        {/* Кнопка "Список галактик" всегда ведёт на /galaxies без query */}
        <Link
          to="/galaxies"
          className={`galaxies-btn ${
            location.pathname.startsWith("/galaxies") ? "active" : ""
          }`}
        >
          Список галактик
        </Link>
      </nav>
    </header>
  );
};