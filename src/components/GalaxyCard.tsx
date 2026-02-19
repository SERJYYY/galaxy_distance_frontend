// src/components/GalaxyCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import defaultGalaxy from "../assets/default_galaxy.png";
import "../styles.css";

interface GalaxyCardProps {
  id: number;
  name: string;
  image_url?: string; // URL изображения из MinIO
  onAdd?: (id: number) => void;
  isAuthenticated?: boolean;
}

export const GalaxyCard: React.FC<GalaxyCardProps> = ({
  id,
  name,
  image_url,
  onAdd,
  isAuthenticated = false,
}) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/galaxies/${id}`);
  };

  const handleAddClick = () => {
    if (onAdd && isAuthenticated) onAdd(id);
  };

  return (
    <article className="galaxy-card">
      <img
        className="galaxy-image"
        src={image_url || defaultGalaxy}
        alt={name}
        onError={(e) => {
          // 👇 Если изображение не загрузилось — подставляем дефолтное
          (e.target as HTMLImageElement).src = defaultGalaxy;
        }}
      />
      <h2 className="galaxy-name">{name}</h2>
      <div className="button-group">
        <button className="card-btn" onClick={handleDetailsClick}>
          Подробнее
        </button>
        {isAuthenticated && (
          <button className="card-btn" onClick={handleAddClick}>
            Добавить
          </button>
        )}
      </div>
    </article>
  );
};