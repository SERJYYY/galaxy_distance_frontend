import React, { useState } from "react";
import { GalaxyList } from "../components/GalaxyList";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { mockGalaxies } from "../mock-objects/galaxies"; // <- импортируем моки

export const GalaxiesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGalaxies, setFilteredGalaxies] = useState(mockGalaxies);

  // Функция фильтрации
  const handleSearch = () => {
    const filtered = mockGalaxies.filter((galaxy) =>
      galaxy.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGalaxies(filtered);
  };

  // Обработчик Enter
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      <Breadcrumbs paths={[{ name: "Главная", link: "/" }, { name: "Список галактик" }]} />

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

      {/* Сетка галактик */}
      <GalaxyList galaxies={filteredGalaxies} />
    </div>
  );
};
