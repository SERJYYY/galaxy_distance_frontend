import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getGalaxyById, getGalaxies } from "../api/galaxiesApi";
import type { Galaxy } from "../api/galaxiesApi";
import { findSimilar } from "../utils/embeddings";
import galaxyVideo from "../assets/galaxy_video.mp4";
import defaultImage from "../assets/default_galaxy.png";
import { GalaxyCard } from "../components/GalaxyCard";

export const GalaxyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [galaxy, setGalaxy] = useState<Galaxy | null>(null);
  const [similarGalaxies, setSimilarGalaxies] = useState<Galaxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка основной галактики
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

  // Загрузка похожих галактик
  useEffect(() => {
    const fetchSimilar = async () => {
      if (!galaxy) return;
      try {
        const allGalaxies: Galaxy[] = await getGalaxies(); // все галактики

        // вызываем findSimilar для массива {id, description}
        const similarItems = await findSimilar(
          galaxy.description,
          allGalaxies
            .filter((g: Galaxy) => g.id !== galaxy.id)
            .map((g: Galaxy) => ({ id: g.id, description: g.description }))
        );

        // преобразуем обратно в полный объект Galaxy для карточек
        const similarFull: Galaxy[] = similarItems
          .map((item) => allGalaxies.find((g: Galaxy) => g.id === item.id))
          .filter((g): g is Galaxy => g !== undefined); // TS: фильтруем undefined

        setSimilarGalaxies(similarFull);
      } catch (err) {
        console.error("Ошибка поиска похожих:", err);
      }
    };
    fetchSimilar();
  }, [galaxy]);

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

      {/* Похожие услуги */}
      {similarGalaxies.length > 0 && (
        <section>
          <h2>Похожие услуги</h2>
          <div className="galaxy-list">
            {similarGalaxies.map((g: Galaxy) => (
              <GalaxyCard
                key={g.id}
                id={g.id}
                name={g.name}
                image_url={g.image_url}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
