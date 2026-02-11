import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1 className="page-title">Добро пожаловать в приложение для расчета растояния для галактик</h1>
            <p>Просматривайте галактики и добавляйте их в заявку.</p>

            {/* Кнопка перехода к списку галактик */}
            <Link to="/galaxies" className="btn-home">
                Перейти к списку галактик
            </Link>
        </div>
    );
};
