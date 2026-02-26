// src/pages/GalaxiesPage.tsx
import React, { useEffect, useState } from "react";  // 👈 Без пробелов!
import { useDispatch, useSelector } from "react-redux";
import { GalaxyList } from "../components/GalaxyList";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getGalaxies } from "../api/galaxiesApi";
import type { Galaxy } from "../api/galaxiesApi";
import { useSearchParams } from "react-router-dom";
import { mockGalaxies } from "../mock-objects/galaxies";
// 👇 Исправьте путь: filterSlice → filtersSlice (с 's')
import { setSearchFilter, clearSearchFilter, selectSearchFilter } from "../slices/filterSlice";
import type { AppDispatch } from "../store";
import "../styles.css";

export const GalaxiesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const searchFilter = useSelector(selectSearchFilter);
  
  const [galaxies, setGalaxies] = useState<Galaxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSearchParams] = useSearchParams();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchFilter);

  const fetchData = async (query: string) => {
    setLoading(true);
    try {
      const data = await getGalaxies(query);
      setGalaxies(data);
    } catch (err) {
      console.warn("⚠ Backend недоступен, используем моки", err);
      const filtered = query
        ? mockGalaxies.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
        : mockGalaxies;
      setGalaxies(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocalSearchQuery(searchFilter);
    fetchData(searchFilter);
  }, [searchFilter]);

  const handleSearch = () => {
    dispatch(setSearchFilter(localSearchQuery));
    setSearchParams(localSearchQuery ? { search: localSearchQuery } : {});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    dispatch(clearSearchFilter());
    setSearchParams({});
  };

  // 👇 Исправленный JSX для loading
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
  <div className="container py-5">  {/* 👈 Открывающий div-обёртка */}
    <Breadcrumbs
      paths={[
        { name: "Главная", link: "/" },
        { name: "Список галактик" },
      ]}
    />

    <h1 className="page-title">Список галактик</h1>  

    <div className="search-container mb-4">
      <input
        type="text"
        className="search-input"
        placeholder="Поиск по названию"
        value={localSearchQuery}
        onChange={(e) => setLocalSearchQuery(e.target.value)}  
        onKeyPress={handleKeyPress}
      />
      
      {/* 👈 && без пробелов */}
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