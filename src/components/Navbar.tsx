// src/components/Navbar.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { logoutSuccess } from "../slices/authSlice";
import type { RootState, AppDispatch } from "../store";
import homeIcon from "../assets/home.png";
import "../styles.css";

// 👇 Утилита для получения CSRF-токена
function getCsrfToken(): string | null {
  const name = "csrftoken";
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return cookieValue || null;
}

export const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, loading } = useSelector(
    (state: RootState) => state.auth
  );

  // 👇 Выход через прямой axios (без thunk)
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/users/logout/",
        {},
        {
          withCredentials: true,
          headers: {
            ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
          },
        }
      );
      dispatch(logoutSuccess());
      navigate("/");
    } catch (err: any) {
      console.error("Ошибка при выходе:", err);
    }
  };

  const displayName = user?.username || "Пользователь";

  return (
    <header className="top-bar">
      {/* 👈 1. Кнопка "Домой" */}
      <Link to="/" className="home-button" aria-label="Главная">
        <img className="home-icon" src={homeIcon} alt="Главная" />
      </Link>

      {/* 👈 2. Навигация */}
      <nav className="navbar-nav">
        <Link
          to="/galaxies"
          className={`nav-link ${
            location.pathname.startsWith("/galaxies") ? "active" : ""
          }`}
        >
          Список галактик
        </Link>

        {isAuthenticated && (
          <>
            <Link
              to="/requests"
              className={`nav-link ${
                location.pathname.startsWith("/requests") ? "active" : ""
              }`}
            >
              Мои заявки
            </Link>
          </>
        )}
      </nav>

      {/* 👉 3. Авторизация */}
      <div className="auth-section">
        {loading ? (
          <span className="spinner-border spinner-border-sm text-light" role="status" />
        ) : isAuthenticated ? (
          <div className="dropdown">
            <button
              className="btn btn-outline-light dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              👤 {displayName}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link className="dropdown-item" to="/profile">
                  Личный кабинет
                </Link>
              </li>
              {user?.is_moderator && (
                <li>
                  <Link className="dropdown-item" to="/moderator">
                    Панель модератора
                  </Link>
                </li>
              )}
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  Выйти
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn-auth">Вход</Link>
            <Link to="/register" className="btn-reg">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
};