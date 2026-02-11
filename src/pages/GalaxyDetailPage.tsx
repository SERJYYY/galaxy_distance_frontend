import React from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";

// Пример mock-данных, замените на реальные при подключении API
const mockGalaxies = [
    {
        id: 1,
        name: "Галактика Андромеда",
        description: "Это ближайшая крупная галактика к Млечному Пути.",
        image_url: "https://via.placeholder.com/300x300?text=Andromeda",
    },
    {
        id: 2,
        name: "Галактика Треугольника",
        description: "Маленькая спиральная галактика в созвездии Треугольника.",
        image_url: "",
    },
];

const defaultImage = "https://via.placeholder.com/300x300?text=Galaxy"; // изображение по умолчанию

export const GalaxyDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const galaxy = mockGalaxies.find(g => g.id === Number(id));

    return (
        <div>
            {/* Breadcrumbs */}
            <Breadcrumbs />

            {!galaxy ? (
                <div className="not-found-message">
                    <h2>Галактика не найдена 😔</h2>
                    <Link to="/galaxies" className="btn">
                        Вернуться к списку галактик
                    </Link>
                </div>
            ) : (
                <>
                    <h1 className="page-title">{galaxy.name}</h1>

                    <div className="galaxy-detail-card">
                        <img
                            className="galaxy-detail-image"
                            src={galaxy.image_url || defaultImage}
                            alt={galaxy.name}
                        />
                        <div className="description-box">{galaxy.description}</div>
                    </div>
                </>
            )}
        </div>
    );
};
