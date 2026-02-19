// src/pages/GalaxyDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Breadcrumbs } from "../components/Breadcrumbs";
import axios from "axios";
import type { RootState } from "../store";
import galaxyVideo from "../assets/galaxy_video.mp4";
import defaultImage from "../assets/default_galaxy.png";
import "../styles.css";

interface Galaxy {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  is_active?: boolean;
}

export const GalaxyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [galaxy, setGalaxy] = useState<Galaxy | null>(null);
  const [similarGalaxies, setSimilarGalaxies] = useState<Galaxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👇 Загрузка данных галактики через axios
  useEffect(() => {
    const fetchGalaxy = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await axios.get<Galaxy>(
          `http://localhost:8000/api/galaxies/${id}/`,
          { withCredentials: true }
        );
        setGalaxy(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || "Ошибка загрузки услуги");
      } finally {
        setLoading(false);
      }
    };
    fetchGalaxy();
  }, [id]);

  // 👇 Загрузка похожих галактик (список всех, затем фильтрация)
  useEffect(() => {
    const fetchSimilar = async () => {
      if (!galaxy) return;
      try {
        const response = await axios.get<Galaxy[]>(
          "http://localhost:8000/api/galaxies/",
          { withCredentials: true }
        );
        // Исключаем текущую галактику и берём первые 3
        const similar = response.data
          .filter((g) => g.id !== galaxy.id)
          .slice(0, 3);
        setSimilarGalaxies(similar);
      } catch (err) {
        console.error("Ошибка загрузки похожих:", err);
      }
    };
    fetchSimilar();
  }, [galaxy]);

  if (loading) {
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

  if (error || !galaxy) {
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
          <h2>⚠️ {error || "Услуга не найдена"}</h2>
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

      {/* Карточка галактики */}
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

        {/* 👇 Кнопка редактирования для модератора */}
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

      {/* Видео под карточкой */}
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

      {/* Похожие услуги */}
      {similarGalaxies.length > 0 && (
        <section>
          <h2 className="mb-4">Похожие услуги</h2>
          <div className="galaxy-grid">
            {similarGalaxies.map((g) => (
              <div key={g.id} className="galaxy-card">
                {g.image_url ? (
                  <img
                    src={g.image_url}
                    alt={g.name}
                    className="galaxy-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultImage;
                    }}
                  />
                ) : (
                  <div className="galaxy-image-placeholder">
                    <span>Нет изображения</span>
                  </div>
                )}
                <h3 className="galaxy-name">{g.name}</h3>
                <div className="button-group">
                  <div className="btn-wrapper">
                    <Link to={`/galaxies/${g.id}`} className="card-btn">
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};