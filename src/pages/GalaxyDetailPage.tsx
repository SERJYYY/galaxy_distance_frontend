// src/pages/GalaxyDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { GalaxyCard } from "../components/GalaxyCard";
import {
  fetchGalaxyDetailStart,
  fetchGalaxyDetailSuccess,
  fetchGalaxyDetailFailure,
  fetchGalaxiesStart,
  fetchGalaxiesSuccess,
  clearDetail,
  setCartCount,
  addToCart,
} from "../slices/galaxiesSlice";
import { 
  getGalaxyDetail, 
  getGalaxies, 
  getCartCount, 
  trackGalaxyView,
  // getRecentlyViewed,  // 👈 ЗАКОММЕНТИРОВАНО: не используется
} from "../api/galaxyApi";
import type { RootState, AppDispatch } from "../store";
import type { Galaxy } from "../api/Api";
import galaxyVideo from "../assets/galaxy_video.mp4";
import defaultImage from "../assets/default_galaxy.png";
import "../styles.css";

export const GalaxyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { detail: galaxy, detailLoading, detailError, galaxies } = useSelector(
    (state: RootState) => state.galaxies
  );

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [similarGalaxies, setSimilarGalaxies] = useState<Galaxy[]>([]);
  // const [recentlyViewed, setRecentlyViewed] = useState<Galaxy[]>([]); // 👈 ЗАКОММЕНТИРОВАНО: state для недавно просмотренных
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 👇 Загрузка детали галактики через прямой axios (без thunk)
  useEffect(() => {
    const loadGalaxy = async () => {
      if (!id) return;
      dispatch(fetchGalaxyDetailStart());
      try {
        const data = await getGalaxyDetail(Number(id));
        dispatch(fetchGalaxyDetailSuccess(data));
        
        // Отслеживаем просмотр
        if (!isAuthenticated) {
          await trackGalaxyView(Number(id));
        }
      } catch (err: any) {
        dispatch(fetchGalaxyDetailFailure(err.response?.data?.error || "Ошибка загрузки"));
      }
    };
    loadGalaxy();

    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, id, isAuthenticated]);

  // 👇 ЗАКОММЕНТИРОВАНО: Загрузка недавно просмотренных
  /*
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      if (!galaxy?.id || isAuthenticated) return;
      try {
        const viewed = await getRecentlyViewed();
        // Исключаем текущую галактику из списка
        const filtered = viewed.filter((g: Galaxy) => g.id !== galaxy.id);
        setRecentlyViewed(filtered.slice(0, 3));
      } catch (err) {
        console.error("Ошибка загрузки недавно просмотренных:", err);
      }
    };
    loadRecentlyViewed();
  }, [galaxy?.id, isAuthenticated]);
  */

  // 👇 Загрузка похожих галактик через прямой axios
  useEffect(() => {
    const loadSimilar = async () => {
      if (!galaxy) return;
      try {
        let allGalaxies = galaxies;
        if (allGalaxies.length === 0) {
          dispatch(fetchGalaxiesStart());
          const data = await getGalaxies();
          dispatch(fetchGalaxiesSuccess(data));
          allGalaxies = data;
        }

        const similar = allGalaxies
          .filter((g: Galaxy) => g.id !== galaxy.id)
          .slice(0, 3);

        setSimilarGalaxies(similar);
      } catch (err: any) {
        console.error("Ошибка загрузки похожих:", err);
      }
    };
    loadSimilar();
  }, [galaxy, galaxies, dispatch]);

  // 👇 Добавление в черновик (ИСПОЛЬЗУЕТ THUNK + КОДОГЕНЕРАЦИЮ)
  const handleAddToCart = async () => {
    if (!galaxy?.id) return;
    try {
      await dispatch(addToCart(galaxy.id)).unwrap();
      setSuccessMessage("Галактика добавлена в черновик!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      const count = await getCartCount();
      dispatch(setCartCount(count));
    } catch (err: any) {
      console.error("Ошибка добавления в черновик:", err);
    }
  };

  if (detailLoading) {
    return (
      <div className="container py-5">
        <Breadcrumbs
          paths={[
            { name: "Главная", link: "/" },
            { name: "Список галактик", link: "/galaxies" },
            { name: "Загрузка..." },
          ]}
        />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  if (detailError || !galaxy) {
    return (
      <div className="container py-5">
        <Breadcrumbs
          paths={[
            { name: "Главная", link: "/" },
            { name: "Список галактик", link: "/galaxies" },
            { name: "Ошибка" },
          ]}
        />
        <div className="not-found-message">
          <h2>⚠️ {detailError || "Услуга не найдена"}</h2>
          <Link to="/galaxies" className="btn">
            ← Вернуться к списку галактик
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Список галактик", link: "/galaxies" },
          { name: galaxy.name },
        ]}
      />

      <h1 className="page-title mb-4">{galaxy.name}</h1>

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

      <div className="galaxy-detail-card portrait mb-4">
        <img
          className="galaxy-detail-image"
          src={galaxy.image_url || defaultImage}
          alt={galaxy.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="description-box">
          <p className="lead">{galaxy.description}</p>
        </div>

        {isAuthenticated && user?.is_moderator && (
          <div className="text-center mt-3">
            <Link
              to={`/galaxies/${galaxy.id}/edit`}
              className="btn-home"
              style={{ backgroundColor: "#28a745" }}
            >
              ✏️ Редактировать услугу
            </Link>
          </div>
        )}
      </div>

      <div className="galaxy-video-wrapper mb-5">
        <video
          src={galaxyVideo}
          autoPlay
          muted
          loop
          playsInline
          className="galaxy-video"
        />
      </div>
      
      {/* 👇 ЗАКОММЕНТИРОВАНО: Секция "Недавно просмотренные" */}
      {/*
      {!isAuthenticated && recentlyViewed.length > 0 && (
        <section>
          <h2 className="mb-4">Недавно просмотренные</h2>
          <div className="galaxy-grid">
            {recentlyViewed.map((g) => (
              <GalaxyCard
                key={`recent-${g.id}`}
                id={g.id!}
                name={g.name}
                image_url={g.image_url}
                isAuthenticated={isAuthenticated}
                onAdd={isAuthenticated ? handleAddToCart : undefined}
              />
            ))}
          </div>
        </section>
      )}
      */}

      {/* 👇 Секция "Похожие услуги" */}
      {similarGalaxies.length > 0 && (
        <section>
          <h2 className="mb-4">Похожие услуги</h2>
          <div className="galaxy-grid">
            {similarGalaxies.map((g) => (
              <GalaxyCard
                key={`similar-${g.id}`}
                id={g.id!}
                name={g.name}
                image_url={g.image_url}
                isAuthenticated={isAuthenticated}
                isModerator={user?.is_moderator}
                onAdd={
                  isAuthenticated && !user?.is_moderator  // 👇 onAdd только для НЕ-модераторов
                    ? handleAddToCart
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};