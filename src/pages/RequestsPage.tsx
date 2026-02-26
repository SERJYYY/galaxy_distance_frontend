// src/pages/RequestsPage.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { api } from "../api";
import type { RootState } from "../store";
import type { GalaxyRequestList } from "../api/Api";
import "../styles.css";

// 👇 Тип заявки
type Request = GalaxyRequestList & {
  galaxies?: Array<{
    id: number;
    name: string;
    magnitude: number;
    distance: number;
  }>;
};

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // 👇 Состояния для заявок
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👇 Состояния для фильтров
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 👇 Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // 👇 Загрузка заявок
  const fetchRequests = async () => {
    try {
      const response = await api.galaxyRequests.galaxyRequestsList();
      // 👇 Фильтруем черновики и удалённые
      const filtered = response.data.filter(
        (req) => req.status !== "draft" && req.status !== "deleted"
      );
      setRequests(filtered);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Initial load
  useEffect(() => {
    fetchRequests();
  }, []);

  // 👇 Фильтрация на фронтенде
  useEffect(() => {
    let filtered = [...requests];

    // 👇 Обычные пользователи видят ТОЛЬКО свои заявки
    if (!user?.is_moderator) {
      filtered = filtered.filter((req) => req.creator === user?.username);
    }

    // Фильтр по дате
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((req) => {
        if (!req.submitted_at) return false;
        const reqDate = new Date(req.submitted_at.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1"));
        return reqDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((req) => {
        if (!req.submitted_at) return false;
        const reqDate = new Date(req.submitted_at.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1"));
        return reqDate <= toDate;
      });
    }

    // Фильтр по статусу
    if (statusFilter) {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, user, dateFrom, dateTo, statusFilter]);

  // 👇 Определяем, модератор ли это
  const isModerator = user?.is_moderator === true;

  // 👇 Динамические заголовки и breadcrumbs
  const pageTitle = isModerator ? "Панель модератора" : "Мои заявки";
  const breadcrumbsPaths = [
    { name: "Главная", link: "/" },
    { name: pageTitle },
  ];

  // 👇 Статусы для отображения
  const statusLabels: Record<string, string> = {
    submitted: "На проверке",
    completed: "Завершена",
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

  return (
    <div className="container py-5">
      <Breadcrumbs paths={breadcrumbsPaths} />

      <h1 className="auth-form-title">{pageTitle}</h1>

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

      {/* 👇 Фильтры */}
      <div className="moderator-filters">
        <div className="filter-group">
          <label className="form-label">Дата с</label>
          <input
            type="date"
            className="form-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="form-label">Дата по</label>
          <input
            type="date"
            className="form-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="form-label">Статус</label>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Все статусы</option>
            <option value="submitted">На проверке</option>
            <option value="completed">Завершена</option>
            <option value="rejected">Отклонена</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">&nbsp;</label>
          <button
            className="btn-auth"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setStatusFilter("");
            }}
          >
            Сбросить
          </button>
        </div>
      </div>

      {/* 👇 Таблица заявок */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="alert-warning">
          <span>
            {isModerator ? "Заявок не найдено" : "У вас пока нет заявок"}
          </span>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                {/* 👇 Колонка "Создатель" только для модераторов */}
                {isModerator && <th>Создатель</th>}
                <th>Телескоп</th>
                <th>Дата формирования</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>#{req.id}</td>
                  {/* 👇 Показываем создателя только модераторам */}
                  {isModerator && <td>{req.creator || "—"}</td>}
                  <td>{req.telescope || "—"}</td>
                  <td>{req.submitted_at || "—"}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusColors[req.status || "submitted"] }}
                    >
                      {statusLabels[req.status || "submitted"]}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {/* 👇 Кнопка просмотра — для всех */}
                      <Link
                        to={`/requests/${req.id}`}
                        className="btn-view"
                        title="Просмотреть детали"
                      >
                        👁
                      </Link>
                      {/* 👇 Нет кнопок одобрения/отклонения — они на странице деталей */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};