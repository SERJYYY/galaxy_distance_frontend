import React from "react";
import { GalaxyCard } from "./GalaxyCard";
import type { Galaxy } from "../api/Api";

interface GalaxyListProps {
  galaxies: Galaxy[];
  onAdd?: (id: number) => void;
}

export const GalaxyList: React.FC<GalaxyListProps> = ({ galaxies, onAdd }) => {
  return (
    <div className="galaxy-grid">
      {galaxies.map((galaxy) =>
        galaxy.id !== undefined ? (
          <GalaxyCard
            key={galaxy.id}
            id={galaxy.id}
            name={galaxy.name}
            image_url={galaxy.image_url} // здесь передаем URL картинки
            onAdd={onAdd}
          />
        ) : null
      )}
    </div>
  );
};
