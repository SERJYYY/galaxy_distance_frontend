import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getGalaxyById } from "../api/galaxiesApi";
import galaxyVideo from "../assets/galaxy_video.mp4";
import type { Galaxy } from "../api/galaxiesApi";
import defaultImage from "../assets/default_galaxy.png";



export const GalaxyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [galaxy, setGalaxy] = useState<Galaxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalaxy = async () => {
      if (!id) return;
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

  if (loading) return <p>Загрузка...</p>;
  if (error)
    return (
      <div>
        <p>{error}</p>
        <Link to="/galaxies" className="btn">
          Вернуться к списку галактик
        </Link>
      </div>
    );

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Список галактик", link: "/galaxies" },
          { name: galaxy?.name || "" },
        ]}
      />

      <h1 className="page-title">{galaxy?.name}</h1>

      {/* Карточка галактики */}
      <div className="galaxy-detail-card portrait">
        <img
          className="galaxy-detail-image"
          src={galaxy?.image_url || defaultImage}
          alt={galaxy?.name}
        />
        <div className="description-box">{galaxy?.description}</div>
      </div>

      {/* Видео под карточкой */}
      <div className="galaxy-video-wrapper">
        <video
          src={galaxyVideo}
          autoPlay
          muted
          loop
          playsInline
          className="galaxy-video"
        />
      </div>
    </div>
  );
};
