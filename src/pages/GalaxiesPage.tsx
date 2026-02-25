// src/pages/GalaxiesPage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import {
  fetchGalaxiesStart,
  fetchGalaxiesSuccess,
  fetchGalaxiesFailure,
  clearError,
  setCartCount,
  addToCart,
} from "../slices/galaxiesSlice";
// 👇 Импорт из filtersSlice
import {
  setSearchFilter,
  clearFilters,
  selectSearchFilter,
} from "../slices/filtersSlice";
import { getGalaxies, getCartCount } from "../api/galaxyApi";
import type { RootState, AppDispatch } from "../store";
import type { Galaxy } from "../api/Api";
import cartIcon from "../assets/cart-icon.png";
import defaultImage from "../assets/default_galaxy.png";
import "../styles.css";

export const GalaxiesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { galaxies, loading, error, cartCount } = useSelector(
    (state: RootState) => state.galaxies
  );

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // 👇 Получаем поисковый запрос из Redux (вместо локального useState)
  const searchFilter = useSelector(selectSearchFilter);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 👇 Загрузка галактик с применением фильтра из Redux
  useEffect(() => {
    const loadGalaxies = async () => {
      dispatch(fetchGalaxiesStart());
      try {
        // 👇 Передаём параметры из Redux
        const params: Record<string, string> = {};
        if (searchFilter) {
          params.search = searchFilter;
        }
        
        const data = await getGalaxies(params);
        dispatch(fetchGalaxiesSuccess(data));
      } catch (err: any) {
        dispatch(fetchGalaxiesFailure(err.response?.data?.error || "Ошибка загрузки"));
      }
    };
    
    // 👇 Дебаунс: ждём 300мс после изменения фильтра перед запросом
    const timeoutId = setTimeout(loadGalaxies, 300);
    return () => clearTimeout(timeoutId);
  }, [dispatch, searchFilter]);  // 👇 Зависимость от searchFilter из Redux

  // 👇 Загрузка счётчика корзины
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

  // 👇 Обработчик изменения поиска — обновляет Redux (автоматически сохраняется в localStorage)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setSearchFilter(value));  // 👇 Обновляем Redux, а не локальный стейт
  };

  // 👇 Очистка фильтра поиска
  const handleClearSearch = () => {
    dispatch(setSearchFilter(""));
  };

  // 👇 Добавление в черновик
  const handleAddToCart = async (galaxyId: number | undefined, galaxyName: string) => {
    if (!galaxyId) return;
    try {
      await dispatch(addToCart(galaxyId)).unwrap();
      setSuccessMessage(`"${galaxyName}" добавлена в черновик!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      const count = await getCartCount();
      dispatch(setCartCount(count));
    } catch (err: any) {
      console.error("Ошибка добавления в черновик:", err);
    }
  };

  // 👇 Фильтрация на фронтенде (опционально, если бэкенд не фильтрует)
  const filteredGalaxies = galaxies.filter((galaxy: Galaxy) => {
    if (!searchFilter) return true;
    return galaxy.name?.toLowerCase().includes(searchFilter.toLowerCase());
  });

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

      {/* 👇 Поиск — значение из Redux */}
      <form className="search-container" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по названию..."
          value={searchFilter}  // 👇 Значение из Redux, не локальный стейт
          onChange={handleSearchChange}  // 👇 Обновляем Redux при вводе
        />
        {searchFilter && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClearSearch}
            title="Очистить поиск"
          >
            ✕
          </button>
        )}
        <button type="submit" className="search-btn" disabled>
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
          <span>{searchFilter ? `Ничего не найдено по запросу "${searchFilter}"` : "Галактики не найдены"}</span>
          {searchFilter && (
            <button className="btn-link ms-2" onClick={handleClearSearch}>
              Очистить поиск
            </button>
          )}
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