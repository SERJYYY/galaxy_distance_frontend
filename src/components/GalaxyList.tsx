import React from "react";
import { GalaxyCard } from "./GalaxyCard";

interface Galaxy {
    id: number;
    name: string;
    image_url?: string;
}

interface GalaxyListProps {
    galaxies: Galaxy[];
}

export const GalaxyList: React.FC<GalaxyListProps> = ({ galaxies }) => {
    return (
        <section>
            <div className="galaxy-grid">
                {galaxies.map(g => (
                    <GalaxyCard
                        key={g.id}
                        {...g}
                        onAdd={(id) => console.log("Добавлено", id)}
                    />
                ))}
            </div>
        </section>
    );
};

