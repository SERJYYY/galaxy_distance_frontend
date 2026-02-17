import React, { useEffect, useState } from "react";
import { GalaxyList } from "../components/GalaxyList";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getGalaxies } from "../api/galaxiesApi";
import type { Galaxy } from "../api/galaxiesApi";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { mockGalaxies } from "../mock-objects/galaxies";


export const GalaxiesPage: React.FC = () => {
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const queryParam = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam);

  // Загрузка данных с бэка или мока
  const fetchData = async (query: string) => {
    setLoading(true);
    try {
      console.log("Запрос к бэку:", query);
      const data = await getGalaxies(query);
      console.log("Данные с бэка:", data);
      setGalaxies(data);
    } catch (err) {
      console.warn("Бэк недоступен, используем моки", err);

      const filtered = query
        ? mockGalaxies.filter((g) =>
            g.name.toLowerCase().includes(query.toLowerCase())
          )
        : mockGalaxies;

      console.log("Моки после фильтрации:", filtered);

      const mapped = filtered.map((g) => ({
        ...g,
        image_url: g.image_url || undefined,
      }));

      console.log("Моки после маппинга (image_url проверка):", mapped);

      setGalaxies(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(queryParam);
    fetchData(queryParam);
  }, [location.search]);

  const handleSearch = () => {
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Список галактик" },
        ]}
      />

      <h1 className="page-title">Список галактик</h1>

      {/* Поиск */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по названию"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="search-btn" onClick={handleSearch}>
          Найти
        </button>
      </div>

      <GalaxyList galaxies={galaxies} />
    </div>
  );
};