// src/pages/CartPage.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { api } from "../api";
import type { RootState } from "../store";
import type { GalaxyRequestList } from "../api/Api";
import defaultImage from "../assets/default_galaxy.png";
import "../styles.css";

// 👇 Тип черновой заявки
type DraftRequest = GalaxyRequestList & {
  telescope: string;
  galaxies?: Array<{
    id: number;
    name: string;
    magnitude: number;
    distance: number;
    image_url?: string;
  }>;
};

export const CartPage: React.FC = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [draft, setDraft] = useState<DraftRequest | null>(null);
  const [telescope, setTelescope] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingMagnitude, setEditingMagnitude] = useState<number | null>(null);
  const [magnitudeValue, setMagnitudeValue] = useState<string>("");

  // 👇 Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // 👇 Загрузка черновой заявки с изображениями
  const fetchDraft = async () => {
    try {
      // 1. Получаем ID черновика через CartIconView
      const cartInfo = await api.galaxyRequests.getCartIcon();
      const draftId = cartInfo.data.draft_id;
      
      if (draftId) {
        // 2. Загружаем детали черновика с галактиками
        const detailResponse = await api.galaxyRequests.galaxyRequestsRead(String(draftId));
        
        // 3. Загружаем изображения для каждой галактики
        const galaxiesWithImages = await Promise.all(
          (detailResponse.data.galaxies || []).map(async (galaxy) => {
            try {
              const galaxyDetail = await api.galaxies.getGalaxyDetail(galaxy.id!);
              return {
                ...galaxy,
                image_url: galaxyDetail.data.image_url || defaultImage,
              };
            } catch {
              return {
                ...galaxy,
                image_url: defaultImage,
              };
            }
          })
        );
        
        setDraft({
          ...detailResponse.data,
          galaxies: galaxiesWithImages,
        } as DraftRequest);
        setTelescope(detailResponse.data.telescope || "");
      } else {
        setDraft(null);
        setTelescope("");
      }
      setError(null);
    } catch (err: any) {
      console.error("Ошибка загрузки черновика:", err);
      setError(err.response?.data?.error || "Ошибка загрузки черновика");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraft();
  }, []);

  // 👇 Обновление телескопа
  const handleUpdateTelescope = async () => {
    try {
      await api.galaxyRequests.galaxyRequestsUpdateUpdate({
        telescope,
      });
      setSuccessMessage("Телескоп обновлён!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchDraft();
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка обновления телескопа");
    }
  };

  // 👇 Обновление видимой звёздной величины (ИСПРАВЛЕНО)
  const handleUpdateMagnitude = async (galaxyId: number) => {
    try {
      await api.galaxyRequests.updateMagnitude({
        galaxy_id: galaxyId,
        magnitude: parseFloat(magnitudeValue),
      });
      setSuccessMessage("Величина обновлена!");
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingMagnitude(null);
      await fetchDraft();
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка обновления величины");
    }
  };

  // 👇 Удаление услуги из черновика (ИСПРАВЛЕНО: galaxy_id в URL)
  const handleRemoveGalaxy = async (galaxyId: number) => {
    if (!confirm("Удалить эту галактику из черновика?")) return;
    try {
      // Бэкенд сам найдёт черновик по пользователю, galaxy_id передаётся в URL
      await api.galaxyRequests.removeGalaxyFromDraft(String(galaxyId));
      setSuccessMessage("Галактика удалена!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchDraft();
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка удаления галактики");
    }
  };

  // 👇 Формирование заявки
  const handleSubmitRequest = async () => {
    if (!telescope.trim()) {
      setError("Укажите телескоп перед отправкой заявки");
      return;
    }
    if (!draft?.galaxies || draft.galaxies.length === 0) {
      setError("Добавьте хотя бы одну галактику в заявку");
      return;
    }
    try {
      await api.galaxyRequests.galaxyRequestsFormUpdate();
      setSuccessMessage("Заявка успешно сформирована и отправлена на проверку!");
      setTimeout(() => {
        setSuccessMessage(null);
        navigate("/requests");
      }, 3000);
      await fetchDraft();
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка формирования заявки");
    }
  };

  // 👇 Удаление всего черновика
  const handleDeleteDraft = async () => {
    if (!confirm("Вы уверены, что хотите удалить весь черновик?")) return;
    try {
      await api.galaxyRequests.galaxyRequestsDeleteDelete();
      setSuccessMessage("Черновик удалён!");
      setTimeout(() => {
        setSuccessMessage(null);
        setDraft(null);
        setTelescope("");
      }, 3000);
      await fetchDraft();
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка удаления черновика");
    }
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
            { name: "Корзина" },
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
          { name: "Корзина" },
        ]}
      />

    

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

      {!draft ? (
        // 👇 Нет черновика
        <div className="cart-empty-message">
          <h2>🛒 Корзина пуста</h2>
          <p>Добавьте галактики для исследования, чтобы создать заявку</p>
          <Link to="/galaxies" className="btn-auth">
            Перейти к каталогу галактик
          </Link>
        </div>
      ) : (
        // 👇 Есть черновик
        <>
          {/* Поле телескопа */}
          <div className="cart-telescope-field">
            <label className="form-label">Телескоп *</label>
            <div className="telescope-input-group">
              <input
                type="text"
                className="form-input"
                value={telescope}
                onChange={(e) => setTelescope(e.target.value)}
                placeholder="Укажите телескоп"
              />
              <button
                className="btn-auth"
                onClick={handleUpdateTelescope}
                disabled={!telescope.trim()}
              >
                Обновить
              </button>
            </div>
          </div>

          {/* Карточки услуг (БЕЗ расстояния, С редактированием magnitude) */}
          {draft.galaxies && draft.galaxies.length > 0 ? (
            <div className="request-grid">
              {draft.galaxies.map((galaxy) => (
                <div key={galaxy.id} className="request-card">
                  <img
                    src={galaxy.image_url || defaultImage}
                    alt={galaxy.name}
                    className="galaxy-request-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultImage;
                    }}
                  />
                  <span className="galaxy-request-name">{galaxy.name}</span>
                  
                  {/* 👇 Редактирование magnitude */}
                  <div className="magnitude-field">
                    {editingMagnitude === galaxy.id ? (
                      <>
                        <input
                          type="number"
                          step="0.01"
                          className="magnitude-input"
                          value={magnitudeValue}
                          onChange={(e) => setMagnitudeValue(e.target.value)}
                          autoFocus
                        />
                        <button
                          className="btn-magnitude-save"
                          onClick={() => handleUpdateMagnitude(galaxy.id!)}
                        >
                          ✓
                        </button>
                        <button
                          className="btn-magnitude-cancel"
                          onClick={() => setEditingMagnitude(null)}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div
                        className="col magnitude"
                        onClick={() => {
                          setEditingMagnitude(galaxy.id!);
                          setMagnitudeValue(galaxy.magnitude?.toString() || "");
                        }}
                        title="Нажмите для редактирования"
                      >
                        {galaxy.magnitude?.toFixed(2) || "—"}
                      </div>
                    )}
                  </div>

                  {/* 👇 Кнопка удаления */}
                  <button
                    className="btn-remove-galaxy"
                    onClick={() => {
                      if (galaxy.id) {
                        handleRemoveGalaxy(galaxy.id);
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert-warning">
              <span>В заявке нет услуг. Добавьте галактики из каталога</span>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="cart-actions">
            <button
              className="btn-delete-draft"
              onClick={handleDeleteDraft}
            >
              Удалить заявку
            </button>
            <button
              className="btn-submit-request"
              onClick={handleSubmitRequest}
              disabled={!telescope.trim() || !draft.galaxies || draft.galaxies.length === 0}
            >
              Сформировать заявку
            </button>
          </div>
        </>
      )}
    </div>
  );
};