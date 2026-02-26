// src/pages/GalaxyDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getGalaxyById } from "../api/galaxiesApi";
import type { Galaxy } from "../api/galaxiesApi";
import defaultImage from "../assets/default_galaxy.png";
import { dest_img, dest_api } from "../utils/target_config";
import "../styles.css";

export const GalaxyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [galaxy, setGalaxy] = useState<Galaxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalaxy = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getGalaxyById(Number(id));
        setGalaxy(data);
      } catch (err) {
        setError("Галактика не найдена");
      } finally {
        setLoading(false);
      }
    };
    fetchGalaxy();
  }, [id]);

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
          <h2>⚠️ {error || "Галактика не найдена"}</h2>
          <Link to="/galaxies" className="btn">← Вернуться к списку</Link>
        </div>
      </div>
    );
  }

  // 👇 Исправляем URL картинки для Tauri
  const fixedImageUrl = galaxy.image_url
    ? galaxy.image_url.replace("/img-proxy", dest_img).replace("/api", dest_api)
    : undefined;

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

      <div className="galaxy-detail-card portrait mb-4">
        <img
          className="galaxy-detail-image"
          src={fixedImageUrl || defaultImage}
          alt={galaxy.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="description-box">
          <p className="lead">{galaxy.description}</p>
        </div>
      </div>

      <div className="galaxy-video-wrapper mb-5">
        <video autoPlay muted loop playsInline className="galaxy-video">
          <source src="../assets/galaxy_video.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};