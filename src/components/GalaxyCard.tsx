// src/components/GalaxyCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import defaultImage from "../assets/default_galaxy.png";
import { dest_img, dest_api } from "../utils/target_config";
import "../styles.css";

interface GalaxyCardProps {
  id: number;
  name: string;
  image_url?: string;
}

export const GalaxyCard: React.FC<GalaxyCardProps> = ({ id, name, image_url }) => {
  // 👇 Исправляем URL картинки для Tauri
  const fixedImageUrl = image_url
    ? image_url.replace("/img-proxy", dest_img).replace("/api", dest_api)
    : undefined;

  return (
    <div className="galaxy-card">
      <img
        className="galaxy-image"
        src={fixedImageUrl || defaultImage}
        alt={name}
        onError={(e) => {
          (e.target as HTMLImageElement).src = defaultImage;
        }}
      />
      <h3 className="galaxy-name">{name}</h3>
      
      {/* 👇 Явная кнопка "Подробнее" */}
      <Link to={`/galaxies/${id}`} className="card-btn">
        Подробнее
      </Link>
    </div>
  );
};