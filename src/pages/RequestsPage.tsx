// src/pages/RequestsPage.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { api } from "../api";
import type { RootState } from "../store";
import type { GalaxyRequestList } from "../api/Api";
import "../styles.css";

// 👇 Тип заявки (наследуем из API + расширяем)
type Request = GalaxyRequestList & {
  galaxies?: Array<{
    id: number;
    name: string;
    magnitude: number;
    distance: number;
  }>;
  calculated_galaxy_count?: string;
};

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // 👇 Флаг загрузки пользователя — защита от race condition
  const isUserLoading = !user || user.username === undefined || user.username === "";

  // 👇 Определяем модератора ТОЛЬКО после полной загрузки user
  const isModerator = user?.is_moderator === true && !isUserLoading;

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

  // 👇 Отладочный лог — можно убрать после тестов
  useEffect(() => {
    console.log("🔄 RequestsPage render", {
      pathname: location.pathname,
      username: user?.username,
      is_moderator: user?.is_moderator,
      isModerator: isModerator,
      isUserLoading: isUserLoading,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname, user, isModerator, isUserLoading]);

  // 👇 Загрузка заявок
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.galaxyRequests.galaxyRequestsList();
      // 👇 Фильтруем черновики и удалённые
      const filtered = response.data.filter(
        (req: GalaxyRequestList) => req.status !== "draft" && req.status !== "deleted"
      );
      setRequests(filtered);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Initial load + перезагрузка при навигации
  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // 👇 Фильтрация на фронтенде
  useEffect(() => {
    let filtered = [...requests];

    // 👇 Обычные пользователи видят ТОЛЬКО свои заявки
    if (!isModerator && user?.username) {
      filtered = filtered.filter((req) => req.creator === user.username);
    }

    // Фильтр по дате "с"
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((req) => {
        if (!req.submitted_at) return false;
        const reqDate = new Date(req.submitted_at.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1"));
        return reqDate >= fromDate;
      });
    }

    // Фильтр по дате "по"
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
  }, [requests, user, isModerator, dateFrom, dateTo, statusFilter]);

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

  // 👇 Блокируем рендер, пока не загрузились auth и user
  if (!isAuthenticated || isUserLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  // 👇 КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: key включает pathname + username + isModerator для стабильного ре-маунта
  return (
    <div className="container py-5" key={`${location.pathname}-${user?.username}-${isModerator}`}>
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

      {/* 👇 Фильтры — показываем всем, но модератор видит больше данных */}
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
                <th className="col-id">ID</th>
                {isModerator && <th className="col-creator">Создатель</th>}
                <th className="col-telescope">Телескоп</th>
                <th className="col-submitted">Дата формирования</th>
                <th className="col-status">Статус</th>
                {/* 👇 Колонка "Рассчитано галактик" — всегда рендерится, но модератор видит все значения */}
                <th className="col-calculated">Рассчитано галактик</th>
                <th className="col-actions">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td className="col-id">#{req.id}</td>
                  {isModerator && <td className="col-creator">{req.creator || "—"}</td>}
                  <td className="col-telescope">{req.telescope || "—"}</td>
                  <td className="col-submitted">{req.submitted_at || "—"}</td>
                  <td className="col-status">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: statusColors[req.status || "submitted"] }}
                      title={req.status}
                    >
                      {statusLabels[req.status || "submitted"]}
                    </span>
                  </td>
                  {/* 👇 Поле calculated_galaxy_count — с защитой от undefined */}
                  <td className="col-calculated">
                    <span className="calculated-count">
                      {req.calculated_galaxy_count ?? 0}
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      <Link 
                        to={`/requests/${req.id}`} 
                        className="btn-view" 
                        title="Просмотреть детали"
                      >
                        👁
                      </Link>
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