// src/pages/GalaxyDetailModeratorPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getCsrfHeaders } from "../utils/csrf"; // 👈 Импортируем утилиту
import defaultImage from "../assets/default_galaxy.png";
import "../styles.css";

interface GalaxyDetail {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  is_active?: boolean;
}

export const GalaxyDetailModeratorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [galaxy, setGalaxy] = useState<GalaxyDetail | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 👇 Проверка прав модератора
  useEffect(() => {
    if (!isAuthenticated || !user?.is_moderator) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // 👇 Загрузка данных услуги через axios
  useEffect(() => {
    const fetchGalaxy = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await axios.get<GalaxyDetail>(
          `http://localhost:8000/api/galaxies/${id}/`,
          { 
            withCredentials: true,
            headers: getCsrfHeaders() // 👈 Добавляем CSRF-токен
          }
        );
        setGalaxy(response.data);
        setName(response.data.name);
        setDescription(response.data.description);
        setImagePreview(response.data.image_url || "");
        setError(null);
      } catch (err: any) {
        console.error("Ошибка загрузки:", err.response?.data);
        setError(err.response?.data?.error || "Ошибка загрузки услуги");
      } finally {
        setLoading(false);
      }
    };
    fetchGalaxy();
  }, [id]);

  // 👇 Обработка выбора файла изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 👇 Сохранение изменений (текст + изображение)
  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      setError("Заполните все обязательные поля");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // 1. Обновляем текст (название и описание)
      await axios.put(
        `http://localhost:8000/api/galaxies/${id}/update/`,
        { name, description },
        { 
          withCredentials: true,
          headers: { 
            ...getCsrfHeaders(), // 👈 CSRF-токен
            "Content-Type": "application/json"
          }
        }
      );

      // 2. Если есть новое изображение — загружаем его отдельно
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await axios.post(
          `http://localhost:8000/api/galaxies/${id}/upload-image/`,
          formData,
          {
            withCredentials: true,
            headers: { 
              ...getCsrfHeaders() // 👈 CSRF-токен для multipart
              // Content-Type НЕ указываем — axios сам установит boundary
            },
          }
        );
      }

      setSuccessMessage("Услуга успешно обновлена!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Обновляем данные после сохранения
      const response = await axios.get<GalaxyDetail>(
        `http://localhost:8000/api/galaxies/${id}/`,
        { withCredentials: true, headers: getCsrfHeaders() }
      );
      setGalaxy(response.data);
      setImageFile(null);
    } catch (err: any) {
      console.error("Ошибка сохранения:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  // 👇 Удаление услуги
  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту услугу?")) return;
    try {
      await axios.delete(
        `http://localhost:8000/api/galaxies/${id}/delete/`,
        { 
          withCredentials: true,
          headers: getCsrfHeaders() // 👈 CSRF-токен
        }
      );
      setSuccessMessage("Услуга удалена!");
      setTimeout(() => {
        navigate("/galaxies");
      }, 2000);
    } catch (err: any) {
      console.error("Ошибка удаления:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || "Ошибка удаления");
    }
  };

  if (!isAuthenticated || !user?.is_moderator) {
    return null;
  }

  if (loading) {
    return (
      <div className="container py-5">
        <Breadcrumbs
          paths={[
            { name: "Главная", link: "/" },
            { name: "Список галактик", link: "/galaxies" },
            { name: "Загрузка..." },
          ]}
        />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Список галактик", link: "/galaxies" },
          { name: galaxy?.name || "Редактирование" },
        ]}
      />

      <h1 className="auth-form-title">Редактирование услуги</h1>

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
            Оставьте пустым, если не хотите менять изображение
          </small>
        </div>

        {/* 👇 Правая колонка: Форма редактирования */}
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
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
            <button
              className="btn-delete"
              onClick={handleDelete}
            >
              Удалить услугу
            </button>
            <Link to={`/galaxies/${id}`} className="btn-cancel">
              Отмена
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};