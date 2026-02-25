import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1 className="page-title">Добро пожаловать в приложение для расчета расcтояния до галактик</h1>
            <p>Просматривайте галактики и добавляйте их в заявку.</p>
        </div>
    );
};
