// src/pages/GalaxiesPage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import {
  fetchGalaxiesStart,
  fetchGalaxiesSuccess,
  fetchGalaxiesFailure,
  setSearchQuery,
  clearError,
  setCartCount,
  addToCart, // 👈 Единственный thunk (добавление в черновик)
} from "../slices/galaxiesSlice";
import { getGalaxies, getCartCount } from "../api/galaxyApi"; // 👈 Прямой путь к galaxyApi
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

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [searchQuery, setSearchQueryLocal] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 👇 Загрузка галактик через прямой axios (БЕЗ thunk)
  useEffect(() => {
    const loadGalaxies = async () => {
      dispatch(fetchGalaxiesStart());
      try {
        const data = await getGalaxies();
        dispatch(fetchGalaxiesSuccess(data));
      } catch (err: any) {
        dispatch(fetchGalaxiesFailure(err.response?.data?.error || "Ошибка загрузки"));
      }
    };
    loadGalaxies();
  }, [dispatch]);

  // 👇 Загрузка счётчика корзины через прямой axios
  useEffect(() => {
    const loadCartCount = async () => {
      if (isAuthenticated) {
        try {
          const count = await getCartCount();
          dispatch(setCartCount(count));
        } catch (err) {
          console.error("Ошибка загрузки корзины:", err);
        }
      }
    };
    loadCartCount();
  }, [isAuthenticated, dispatch]);

  // 👇 Обработчик поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(searchQuery));
  };

  // 👇 Добавление в черновик (ЕДИНСТВЕННЫЙ метод с thunk + кодогенерацией)
  const handleAddToCart = async (galaxyId: number | undefined, galaxyName: string) => {
    if (!galaxyId) return;
    try {
      await dispatch(addToCart(galaxyId)).unwrap();
      setSuccessMessage(`"${galaxyName}" добавлена в черновик!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Обновляем счётчик корзины
      const count = await getCartCount();
      dispatch(setCartCount(count));
    } catch (err: any) {
      console.error("Ошибка добавления в черновик:", err);
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
          title={cartCount === 0 ? "Нет активной заявки" : `В заявке: ${cartCount} услуг`}
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