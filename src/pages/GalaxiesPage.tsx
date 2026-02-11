import React, { useEffect, useState } from "react";
import { GalaxyList } from "../components/GalaxyList";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getGalaxies } from "../api/galaxiesApi";
import type { Galaxy } from "../api/galaxiesApi";


export const GalaxiesPage: React.FC = () => {
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalaxies = async () => {
      try {
        const data = await getGalaxies();
        setGalaxies(data);
      } catch (err) {
        setError("Ошибка загрузки галактик");
      } finally {
        setLoading(false);
      }
    };

    fetchGalaxies();
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Breadcrumbs
        paths={[{ name: "Главная", link: "/" }, { name: "Список галактик" }]}
      />

      <h1 className="page-title">Список галактик</h1>

      <GalaxyList galaxies={galaxies} />
    </div>
  );
};
