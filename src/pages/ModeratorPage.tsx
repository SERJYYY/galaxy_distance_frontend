import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { api } from "../api";
import type { RootState } from "../store";
import type { GalaxyRequestList } from "../api/Api"; // 👈 Импортируем тип из API
import "../styles.css";

// 👇 Используем тип из API + расширяем если нужно
type Request = GalaxyRequestList & {
  galaxies?: Array<{
    id: number;
    name: string;
    magnitude: number;
    distance: number;
  }>;
};

export const ModeratorPage: React.FC = () => {
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
  const [creatorFilter, setCreatorFilter] = useState("");

  // 👇 Short polling интервал
  const POLLING_INTERVAL = 5000; // 5 секунд

  // 👇 Проверка прав модератора
  useEffect(() => {
    if (!isAuthenticated || !user?.is_moderator) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // 👇 Загрузка заявок
  const fetchRequests = async () => {
    try {
      const response = await api.galaxyRequests.galaxyRequestsList();
      setRequests(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Initial load + short polling
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // 👇 Фильтрация на фронтенде (по создателю)
  useEffect(() => {
    let filtered = [...requests];

    // Фильтр по создателю (фронтенд)
    if (creatorFilter) {
      filtered = filtered.filter((req) =>
        req.creator?.toLowerCase().includes(creatorFilter.toLowerCase())
      );
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
  }, [requests, creatorFilter, dateFrom, dateTo, statusFilter]);

  // 👇 Обновление статуса заявки
  const handleStatusChange = async (requestId: number, action: "complete" | "rejected") => {
    try {
      // 👇 Преобразуем number в string
      await api.galaxyRequests.galaxyRequestsCompleteUpdate(String(requestId), { action });
      // Обновляем список сразу после изменения
      await fetchRequests();
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

  if (!isAuthenticated || !user?.is_moderator) {
    return null;
  }

  return (
    <div className="container py-5">
      <Breadcrumbs
        paths={[
          { name: "Главная", link: "/" },
          { name: "Панель модератора" },
        ]}
      />

      <h1 className="auth-form-title">Панель модератора</h1>

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
            <option value="completed">Выполнена</option>
            <option value="rejected">Отклонена</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">Создатель</label>
          <input
            type="text"
            className="form-input"
            placeholder="Поиск по имени..."
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="form-label">&nbsp;</label>
          <button
            className="btn-auth"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setStatusFilter("");
              setCreatorFilter("");
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
          <span>Заявок не найдено</span>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Создатель</th>
                <th>Телескоп</th>
                <th>Дата подачи</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>#{req.id}</td>
                  <td>{req.creator || "—"}</td>
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
                    {req.status === "submitted" && (
                      <div className="action-buttons">
                        <button
                          className="btn-complete"
                          onClick={() => handleStatusChange(req.id!, "complete")}
                        >
                          ✓
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleStatusChange(req.id!, "rejected")}
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 👇 Индикатор polling */}
      <div className="polling-indicator">
        <span className="polling-dot" />
        <span>Обновление каждые 5 секунд</span>
      </div>
    </div>
  );
};