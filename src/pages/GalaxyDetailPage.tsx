import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getGalaxyById } from "../api/galaxiesApi"; // твоя функция для API-запроса
import defaultImage from "../assets/default_galaxy.png"; // дефолтное изображение
import type { Galaxy } from "../api/galaxiesApi";

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
        console.error(err);
        setError("Галактика не найдена 😔");
      } finally {
        setLoading(false);
      }
    };

    fetchGalaxy();
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error)
    return (
      <div className="not-found-message">
        <h2>{error}</h2>
        <Link to="/galaxies" className="btn">
          Вернуться к списку галактик
        </Link>
      </div>
    );

  if (!galaxy)
    return (
      <div className="not-found-message">
        <h2>Галактика не найдена 😔</h2>
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
          { name: galaxy.name },
        ]}
      />

      <h1 className="page-title">{galaxy.name}</h1>

      <div className="galaxy-detail-card">
        <img
          className="galaxy-detail-image"
          src={galaxy.image_url || defaultImage}
          alt={galaxy.name}
        />
        <div className="description-box">{galaxy.description}</div>
      </div>
    </div>
  );
};
