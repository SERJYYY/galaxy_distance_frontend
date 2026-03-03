// src/pages/GalaxyVibesPage.tsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { Breadcrumbs } from "../components/Breadcrumbs";
import { api } from "../api";

import type { Galaxy as ApiGalaxy } from "../api/Api";
import galaxyVideo from "../assets/galaxy_video.mp4";
import "../styles.css";

// 👇 Расширенный тип Galaxy
export type Galaxy = ApiGalaxy & {
  distance?: number;
  magnitude?: number;
};

export const GalaxyVibesPage: React.FC = () => {
  const { id: initialGalaxyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
 
  
  const [currentGalaxy, setCurrentGalaxy] = useState<Galaxy | null>(null);
  const [allGalaxies, setAllGalaxies] = useState<Galaxy[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  // 👇 Загрузка всех галактик из API
  const fetchGalaxies = async () => {
    try {
      const response = await api.galaxies.galaxiesList();
      setAllGalaxies(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка загрузки галактик");
      return [];
    }
  };

  // 👇 Загрузка детали галактики из API
  const fetchGalaxyDetail = async (galaxyId: number) => {
    try {
      const response = await api.galaxies.getGalaxyDetail(galaxyId);
      setCurrentGalaxy(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка загрузки галактики");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Инициализация
  useEffect(() => {
    const init = async () => {
      if (!initialGalaxyId) return;
      const galaxies = await fetchGalaxies();
      const startGalaxy = galaxies.find(g => g.id === Number(initialGalaxyId)) || galaxies[0];
      if (startGalaxy?.id) {
        await fetchGalaxyDetail(startGalaxy.id);
      }
    };
    init();
  }, [initialGalaxyId]);

  // 👇 Автовоспроизведение
  useEffect(() => {
    if (videoRef.current && currentGalaxy) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentGalaxy?.id, isPlaying]);

  // 👇 Соседние галактики по ID
  const getAdjacentGalaxy = (direction: "prev" | "next"): Galaxy | undefined => {
    if (!currentGalaxy?.id || allGalaxies.length === 0) return undefined;
    const currentIndex = allGalaxies.findIndex(g => g.id === currentGalaxy.id);
    if (direction === "prev" && currentIndex > 0) return allGalaxies[currentIndex - 1];
    if (direction === "next" && currentIndex < allGalaxies.length - 1) return allGalaxies[currentIndex + 1];
    return undefined;
  };

  // 👇 Свайпы
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = async () => {
    const deltaY = touchStartY.current - touchEndY.current;
    const threshold = 50;

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        const nextGalaxy = getAdjacentGalaxy("next");
        if (nextGalaxy?.id) {
          navigate(`/galaxy-vibes/${nextGalaxy.id}`);
          setIsDescriptionExpanded(false);
          setLoading(true);
          await fetchGalaxyDetail(nextGalaxy.id);
        }
      } else {
        const prevGalaxy = getAdjacentGalaxy("prev");
        if (prevGalaxy?.id) {
          navigate(`/galaxy-vibes/${prevGalaxy.id}`);
          setIsDescriptionExpanded(false);
          setLoading(true);
          await fetchGalaxyDetail(prevGalaxy.id);
        }
      }
    }

    if (deltaY < -threshold && !isDescriptionExpanded) {
      setIsDescriptionExpanded(true);
    }
  };

  // 👇 Навигация кнопками
  const navigateToGalaxy = async (direction: "prev" | "next") => {
    const targetGalaxy = getAdjacentGalaxy(direction);
    if (targetGalaxy?.id) {
      navigate(`/galaxy-vibes/${targetGalaxy.id}`);
      setIsDescriptionExpanded(false);
      setLoading(true);
      await fetchGalaxyDetail(targetGalaxy.id);
    }
  };

  // 👇 Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 👇 Breadcrumbs
  const breadcrumbsPaths = [
    { name: "Главная", link: "/" },
    { name: "Список галактик", link: "/galaxies" },
    { name: currentGalaxy?.name || "Galaxy Vibes" },
  ];

  // 👇 Форматирование описания
  const formatShortDescription = (description: string, maxLength = 80) => {
    if (description.length <= maxLength) return description;
    return `${description.slice(0, maxLength)}...`;
  };

  if (loading && !currentGalaxy) {
    return (
      <div className="container py-5">
        <Breadcrumbs paths={breadcrumbsPaths} />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentGalaxy) {
    return (
      <div className="container py-5">
        <Breadcrumbs paths={breadcrumbsPaths} />
        <div className="not-found-message">
          <h2>⚠️ {error || "Галактика не найдена"}</h2>
          <Link to="/galaxies" className="btn">
            ← Вернуться к списку галактик
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = allGalaxies.findIndex(g => g.id === currentGalaxy.id);
  const hasNext = currentIndex < allGalaxies.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div className="container py-5">
      <Breadcrumbs paths={breadcrumbsPaths} />

      <h1 className="page-title mb-4">🎬 Galaxy Vibes</h1>

      <div
        className="vibes-container-light"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 👇 Видео */}
        <div className="video-wrapper-light">
          <video
            ref={videoRef}
            src={galaxyVideo}
            className="vibes-video"
            autoPlay
            muted
            loop
            playsInline
            onClick={togglePlay}
          />

          {/* 👇 Кнопка Play/Pause */}
          <button className="play-pause-btn-light" onClick={togglePlay} aria-label={isPlaying ? "Пауза" : "Воспроизвести"}>
            {isPlaying ? "⏸️" : "▶️"}
          </button>
        </div>

        {/* 👇 Нижняя панель с названием и описанием */}
        <div
          className={`description-panel-light ${isDescriptionExpanded ? "expanded" : ""}`}
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsDescriptionExpanded(!isDescriptionExpanded);
            }
          }}
        >
          <div className="panel-handle-light">
            <div className="handle-bar-light"></div>
          </div>
          
          <div className="panel-content-light">
            {/* 👇 Название галактики жирным */}
            <h3 className="panel-galaxy-name-light">{currentGalaxy.name}</h3>
            
            {/* 👇 Описание в формате: "M101 — это спиральная галактика..." */}
            <p className="panel-description-light">
              {isDescriptionExpanded
                ? currentGalaxy.description
                : formatShortDescription(currentGalaxy.description)}
            </p>

            {/* 👇 Статистика */}
            {/*<div className="vibes-stats-light">
              {currentGalaxy.distance && (
                <span className="stat-item-light">📏 {currentGalaxy.distance} Мпк</span>
              )}
              <span className="stat-item-light">⭐ ID: {currentGalaxy.id}</span>
            </div>*/}
          </div>

          {/* 👇 Навигация */}
          <div className="navigation-buttons-light">
            <button
              className={`nav-btn-light prev-btn-light ${!hasPrev ? "disabled" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (hasPrev) navigateToGalaxy("prev");
              }}
              disabled={!hasPrev}
              aria-label="Предыдущая галактика"
            >
              ⬆️ Предыдущая
            </button>
            
            <span className="counter-light">
              {currentIndex + 1} / {allGalaxies.length}
            </span>
            
            <button
              className={`nav-btn-light next-btn-light ${!hasNext ? "disabled" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (hasNext) navigateToGalaxy("next");
              }}
              disabled={!hasNext}
              aria-label="Следующая галактика"
            >
              Следующая ⬇️
            </button>
          </div>
        </div>
      </div>

      {/* 👇 Футер с кнопками */}
      <div className="vibes-footer-light">
        <Link to={`/galaxies/${currentGalaxy.id}`} className="btn-home">
          ← Вернуться к деталям
        </Link>
        <Link to="/galaxies" className="btn-outline">
          📋 Все галактики
        </Link>
      </div>
    </div>
  );
};