// src/pages/RequestDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { api } from "../api";
import type { RootState } from "../store";
import type { GalaxyRequestList } from "../api/Api";
import "../styles.css";

// 👇 Тип заявки с деталями
type RequestDetail = GalaxyRequestList & {
  moderator?: string;
  telescope: string;
  created_at: string;
  submitted_at: string;
  completed_at?: string;
  galaxies?: Array<{
    id: number;
    name: string;
    magnitude: number;
    distance: number;
  }>;
};

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👇 Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // 👇 Загрузка деталей заявки
  const fetchRequestDetail = async () => {
    try {
      const response = await api.galaxyRequests.galaxyRequestsRead(String(id));
      setRequest(response.data as unknown as RequestDetail);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        setError("Доступ к этой заявке запрещён");
      } else {
        setError(err.response?.data?.error || "Ошибка загрузки заявки");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestDetail();
    }
  }, [id]);

  // 👇 Обновление статуса (только для модераторов)
  const handleStatusChange = async (action: "complete" | "rejected") => {
    if (!id) return;
    try {
      await api.galaxyRequests.galaxyRequestsCompleteUpdate(id, { action });
      navigate("/moderator");  // 👈 Возврат в панель модератора
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка обновления статуса");
    }
  };

  // 👇 Статусы для отображения
  const statusLabels: Record<string, string> = {
    submitted: "На проверке",
    completed: "Одобрена",
    rejected: "Отклонена",
  };

  const statusColors: Record<string, string> = {
    submitted: "#ffc107",
    completed: "#28a745",
    rejected: "#dc3545",
  };

  // 👇 Определяем, модератор ли это
  const isModerator = user?.is_moderator === true;

  // 👇 Динамические breadcrumbs в зависимости от роли
  const breadcrumbsPaths = isModerator
    ? [
        { name: "Главная", link: "/" },
        { name: "Панель модератора", link: "/moderator" },
        { name: `Заявка #${request?.id || id}` },
      ]
    : [
        { name: "Главная", link: "/" },
        { name: "Мои заявки", link: "/requests" },
        { name: `Заявка #${request?.id || id}` },
      ];

  // 👇 Кнопка возврата в зависимости от роли
  const backLink = isModerator ? "/moderator" : "/requests";
  const backText = isModerator ? "← Вернуться к панели модератора" : "← Вернуться к списку заявок";

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container py-5">
        <Breadcrumbs paths={breadcrumbsPaths} />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="container py-5">
        <Breadcrumbs paths={breadcrumbsPaths} />
        <div className="not-found-message">
          <h2>⚠️ {error || "Заявка не найдена"}</h2>
          <Link to={backLink} className="btn">
            {backText}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Breadcrumbs paths={breadcrumbsPaths} />

      <h1 className="auth-form-title">Заявка #{request.id}</h1>

      {/* 👇 Сообщения об ошибках */}
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

      {/* 👇 Заголовок заявки */}
      <div className="request-header">
        <div className="header-item">
          <strong>Создатель</strong>
          <span className="tel-name">{request.creator || "—"}</span>
        </div>
        <div className="header-item">
          <strong>Телескоп</strong>
          <span className="tel-name">{request.telescope || "—"}</span>
        </div>
        <div className="header-item">
          <strong>Дата подачи</strong>
          <span className="date">{request.submitted_at || "—"}</span>
        </div>
        <div className="header-item">
          <strong>Статус</strong>
          <span
            className="status-badge"
            style={{ backgroundColor: statusColors[request.status || "submitted"] }}
          >
            {statusLabels[request.status || "submitted"]}
          </span>
        </div>
      </div>

      {/* 👇 Таблица услуг в заявке */}
      <h2 className="page-title">Услуги в заявке</h2>

      {request.galaxies && request.galaxies.length > 0 ? (
        <div className="request-table-container">
          <table className="request-table">
            <thead>
              <tr>
                <th className="col-name">Название</th>
                <th className="col-magnitude">Видимая звёздная величина</th>
                <th className="col-distance">Расстояние (Мпк)</th>
              </tr>
            </thead>
            <tbody>
              {request.galaxies.map((galaxy) => (
                <tr key={galaxy.id}>
                  <td className="col-name">{galaxy.name}</td>
                  <td className="col-magnitude">{galaxy.magnitude?.toFixed(2) || "—"}</td>
                  <td className="col-distance">{galaxy.distance?.toFixed(2) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert-warning">
          <span>В этой заявке нет услуг</span>
        </div>
      )}

      {/* 👇 Информация о модераторе (если заявка выполнена/отклонена) */}
      {(request.status === "completed" || request.status === "rejected") && (
        <div className="moderator-info">
          <h3 className="page-title">Информация о проверке</h3>
          <div className="request-header">
            <div className="header-item">
              <strong>Модератор</strong>
              <span className="tel-name">{request.moderator || "—"}</span>
            </div>
            <div className="header-item">
              <strong>Дата проверки</strong>
              <span className="date">{request.completed_at || "—"}</span>
            </div>
          </div>
        </div>
      )}

      {/* 👇 Кнопки действий для модератора (только для заявок "На проверке") */}
      {isModerator && request.status === "submitted" && (
        <div className="mt-4 action-buttons">
          <button
            className="btn-complete"
            onClick={() => handleStatusChange("complete")}
          >
            ✓
          </button>
          <button
            className="btn-reject"
            onClick={() => handleStatusChange("rejected")}
          >
            ✗
          </button>
        </div>
      )}

      {/* 👇 Кнопка назад */}
      <div className="text-center mt-4">
        <Link to={backLink} className="btn-home">
          {backText}
        </Link>
      </div>
    </div>
  );
};