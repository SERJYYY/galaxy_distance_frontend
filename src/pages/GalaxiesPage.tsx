// src/pages/GalaxiesPage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import axios from "axios";
import { addToCart, fetchCartCount, setSearchQuery, clearError } from "../slices/galaxiesSlice";
import type { RootState, AppDispatch } from "../store";
import type { Galaxy } from "../api/Api";
import cartIcon from "../assets/cart-icon.png";
import defaultImage from "../assets/default_galaxy.png";
import "../styles.css";

export const GalaxiesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { galaxies, filteredGalaxies, loading, error, cartCount } = useSelector(
    (state: RootState) => state.galaxies
  );

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [searchQuery, setSearchQueryLocal] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 👇 Загрузка галактик через axios (без кодогенерации)
  useEffect(() => {
    const fetchGalaxies = async () => {
      try {
        const response = await axios.get<Galaxy[]>(
          "http://localhost:8000/api/galaxies/",
          { withCredentials: true }
        );
        // Обновляем Redux state вручную
        dispatch({ type: "galaxies/fetchGalaxies/fulfilled", payload: response.data });
      } catch (err: any) {
        dispatch({ type: "galaxies/fetchGalaxies/rejected", payload: err.response?.data?.error || "Ошибка загрузки" });
      }
    };
    fetchGalaxies();
    
    if (isAuthenticated) {
      dispatch(fetchCartCount());
    }
  }, [dispatch, isAuthenticated]);

  // 👇 Обновление счётчика корзины
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartCount());
    }
  }, [cartCount, isAuthenticated, dispatch]);

  // 👇 Обработчик поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(searchQuery));
  };

  // 👇 Добавление в черновик (используем кодогенерированный API)
  const handleAddToCart = async (galaxyId: number | undefined, galaxyName: string) => {
    if (!galaxyId) {
      dispatch(clearError());
      return;
    }
    try {
      await dispatch(addToCart(galaxyId)).unwrap();
      setSuccessMessage(`"${galaxyName}" добавлена в черновик!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Ошибка уже установлена в slice
    }
  };

  return (
    <div className="container py-5">
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Список галактик" },
        ]}
      />

      <h1 className="page-title">Список галактик</h1>

      {/* 👇 Кнопка создания для модератора */}
      {isAuthenticated && user?.is_moderator && (
        <div className="text-center mb-4">
          <Link to="/galaxies/create" className="btn-home" style={{ backgroundColor: "#28a745" }}>
            ➕ Создать услугу
          </Link>
        </div>
      )}

      {/* 👇 Сообщения об ошибках/успехе */}
      {error && (
        <div className="alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => dispatch(clearError())}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="alert-success" role="alert">
          <span>{successMessage}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setSuccessMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* 👇 Поиск */}
      <form className="search-container" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQueryLocal(e.target.value)}
        />
        <button type="submit" className="search-btn">
          Найти
        </button>
      </form>

      {/* 👇 Сетка галактик */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : filteredGalaxies.length === 0 ? (
        <div className="alert-warning">
          <span>Галактики не найдены</span>
        </div>
      ) : (
        <div className="galaxy-grid">
          {filteredGalaxies.map((galaxy) => (
            <div key={galaxy.id} className="galaxy-card">
              {galaxy.image_url ? (
                <img
                  src={galaxy.image_url}
                  alt={galaxy.name}
                  className="galaxy-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultImage;
                  }}
                />
              ) : (
                <img
                  src={defaultImage}
                  alt={galaxy.name}
                  className="galaxy-image"
                />
              )}

              <h3 className="galaxy-name">{galaxy.name}</h3>

              <div className="button-group">
                <div className="btn-wrapper">
                  <Link
                    to={`/galaxies/${galaxy.id}`}
                    className="card-btn"
                  >
                    Подробнее
                  </Link>
                </div>

                {isAuthenticated && (
                  <div className="btn-wrapper">
                    <button
                      className="card-btn"
                      onClick={() => handleAddToCart(galaxy.id, galaxy.name || "")}
                    >
                      Добавить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 👇 Плавающая кнопка корзины */}
      {isAuthenticated && (
        <Link
          to="/cart"
          className={`calculator-link ${cartCount === 0 ? "cart-disabled" : ""}`}
          title={cartCount === 0 ? "Нет черновика" : `В черновике: ${cartCount} услуг`}
        >
          <img src={cartIcon} alt="Корзина" className="calculator" />
          {cartCount > 0 && (
            <span className="badge">{cartCount}</span>
          )}
        </Link>
      )}
    </div>
  );
};