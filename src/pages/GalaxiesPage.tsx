// src/pages/GalaxiesPage.tsx
import React, { useEffect, useState } from "react";  // 👈 Убраны пробелы
import { useDispatch, useSelector } from "react-redux";  // 👈 Добавлено
import { GalaxyList } from "../components/GalaxyList";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getGalaxies } from "../api/galaxiesApi";
import type { Galaxy } from "../api/galaxiesApi";
import { useSearchParams } from "react-router-dom";  // 👈 Убраны пробелы
import { mockGalaxies } from "../mock-objects/galaxies";
// 👇 Импорты из Redux
import { setSearchFilter, clearSearchFilter, selectSearchFilter } from "../slices/filterSlice";
import type { AppDispatch } from "../store";
import "../styles.css";

export const GalaxiesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchFilter = useSelector(selectSearchFilter);  // 👇 Из Redux
  
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [_searchParams, setSearchParams] = useSearchParams();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchFilter);

  const fetchData = async (query: string) => {
    setLoading(true);
    try {
      console.log("Запрос к бэку:", query);
      const data = await getGalaxies(query);
      console.log("Данные с бэка:", data);
      setGalaxies(data);
    } catch (err) {
      console.warn("⚠ Backend недоступен, используем моки", err);
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

      console.log("Моки после маппинга:", mapped);
      setGalaxies(mapped);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Загрузка при изменении searchFilter из Redux
  useEffect(() => {
    setLocalSearchQuery(searchFilter);
    fetchData(searchFilter);
  }, [searchFilter]);

  const handleSearch = () => {
    dispatch(setSearchFilter(localSearchQuery));  // 👇 Сохраняем в Redux + localStorage
    setSearchParams(localSearchQuery ? { search: localSearchQuery } : {});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    dispatch(clearSearchFilter());  // 👇 Очищаем Redux
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Список галактик" },
        ]}
      />

      <h1 className="page-title">Список галактик</h1>

      {/* Поиск */}
      <div className="search-container mb-4">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск по названию"
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        {localSearchQuery && (
          <button className="search-clear-btn ms-2" onClick={handleClearSearch}>
            ✕
          </button>
        )}
        <button className="search-btn ms-2" onClick={handleSearch}>
          Найти
        </button>
      </div>

      <GalaxyList galaxies={galaxies} />
    </div>
  );
};