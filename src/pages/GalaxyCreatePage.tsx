// src/pages/GalaxyCreatePage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getCsrfHeaders } from "../utils/csrf";
import defaultImage from "../assets/default_galaxy.png";
import "../styles.css";

export const GalaxyCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 👇 Проверка прав модератора
  React.useEffect(() => {
    if (!isAuthenticated || !user?.is_moderator) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // 👇 Обработка выбора файла изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 👇 Создание новой галактики
  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      setError("Заполните все обязательные поля");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Создаём галактику (текст)
      const createResponse = await axios.post(
        "http://localhost:8000/api/galaxies/create/",
        { name, description },
        {
          withCredentials: true,
          headers: {
            ...getCsrfHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      const galaxyId = createResponse.data.id;

      // 2. Если есть изображение — загружаем его
      if (imageFile && galaxyId) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await axios.post(
          `http://localhost:8000/api/galaxies/${galaxyId}/upload-image/`,
          formData,
          {
            withCredentials: true,
            headers: {
              ...getCsrfHeaders(),
              // Content-Type не указываем — axios сам установит boundary
            },
          }
        );
      }

      setSuccessMessage("Галактика успешно создана!");
      setTimeout(() => {
        navigate(`/galaxies/${galaxyId}`);
      }, 2000);
    } catch (err: any) {
      console.error("Ошибка создания:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || "Ошибка создания");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user?.is_moderator) {
    return null;
  }

  return (
    <div className="container py-5">
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Список галактик", link: "/galaxies" },
          { name: "Создание услуги" },
        ]}
      />

      <h1 className="auth-form-title">Создание услуги</h1>

      {/* 👇 Сообщения об ошибках/успехе */}
      {error && (
        <div className="alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="alert-success" role="alert">
          <span>{successMessage}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setSuccessMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="moderator-edit-container">
        {/* 👇 Левая колонка: Предпросмотр изображения */}
        <div className="edit-image-section">
          <label className="form-label">Изображение</label>
          <div className="image-preview-wrapper">
            <img
              src={imagePreview || defaultImage}
              alt="Предпросмотр"
              className="image-preview"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultImage;
              }}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-input mt-3"
          />
          <small className="form-text">
            Необязательно. Можно добавить позже
          </small>
        </div>

        {/* 👇 Правая колонка: Форма создания */}
        <div className="edit-form-section">
          <div className="form-group">
            <label className="form-label">Название *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название галактики"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Описание *</label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание услуги"
              rows={6}
            />
          </div>

          {/* 👇 Кнопки действий */}
          <div className="moderator-actions">
            <button
              className="btn-save"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Создание..." : "Создать"}
            </button>
            <Link to="/galaxies" className="btn-cancel">
              Отмена
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};