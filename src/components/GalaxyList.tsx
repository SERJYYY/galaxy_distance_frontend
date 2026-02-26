import React from "react";
import { GalaxyCard } from "./GalaxyCard";
import type { Galaxy } from "../api/Api";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface GalaxyListProps {
  galaxies: Galaxy[];
  onAdd?: (id: number) => void;
}

export const GalaxyList: React.FC<GalaxyListProps> = ({ galaxies, onAdd }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  return (
    <div className="galaxy-grid">
      {galaxies.map((galaxy) =>
        galaxy.id !== undefined ? (
          <GalaxyCard
            key={galaxy.id}
            id={galaxy.id}
            name={galaxy.name}
            image_url={galaxy.image_url}
            isAuthenticated={isAuthenticated}
            isModerator={user?.is_moderator} 
            onAdd={onAdd}
          />
        ) : null
      )}
    </div>
  );
};
