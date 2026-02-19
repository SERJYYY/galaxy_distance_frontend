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

  const { isAuthenticated } = useSelector(
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

  // 👇 Статусы для отображения
  const statusLabels: Record<string, string> = {
    submitted: "На проверке",
    completed: "Выполнена",
    rejected: "Отклонена",
  };

  const statusColors: Record<string, string> = {
    submitted: "#ffc107",
    completed: "#28a745",
    rejected: "#dc3545",
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container py-5">
        <Breadcrumbs
          paths={[
            { name: "Главная", link: "/" },
            { name: "Мои заявки", link: "/requests" },
            { name: "Заявка #" + id },
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

  if (error || !request) {
    return (
      <div className="container py-5">
        <Breadcrumbs
          paths={[
            { name: "Главная", link: "/" },
            { name: "Мои заявки", link: "/requests" },
            { name: "Заявка #" + id },
          ]}
        />
        <div className="not-found-message">
          <h2>⚠️ {error || "Заявка не найдена"}</h2>
          <Link to="/requests" className="btn">
            Вернуться к списку заявок
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Мои заявки", link: "/requests" },
          { name: `Заявка #${request.id}` },
        ]}
      />

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

      {/* 👇 Кнопка назад */}
      <div className="text-center mt-4">
        <Link to="/requests" className="btn-home">
          ← Вернуться к списку заявок
        </Link>
      </div>
    </div>
  );
};