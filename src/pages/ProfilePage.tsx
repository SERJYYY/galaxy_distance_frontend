// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import axios from "axios";
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  logoutSuccess,
  clearError,
} from "../slices/authSlice";
import type { RootState, AppDispatch } from "../store";
import type { AuthUser } from "../slices/authSlice";
import "../styles.css";

// 👇 Утилита для получения CSRF-токена
function getCsrfToken(): string | null {
  const name = "csrftoken";
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return cookieValue || null;
}

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // 👇 Состояния для формы профиля
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  // 👇 Состояния для формы пароля
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // 👇 Заполняем форму при загрузке данных пользователя
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user, isAuthenticated, navigate]);

  // 👇 Обработчики для формы профиля
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setSuccessMessage(null);
    dispatch(clearError());
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfileStart());

    try {
      // 👇 Прямой вызов axios (без thunk)
      await axios.put(
        "http://localhost:8000/api/users/profile/",
        profileData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
          },
        }
      );

      // Загружаем обновлённый профиль
      const profileResponse = await axios.get(
        "http://localhost:8000/api/users/profile/",
        {
          withCredentials: true,
          headers: {
            ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
          },
        }
      );

      const updatedUser: AuthUser = {
        id: profileResponse.data.id || 0,
        username: profileResponse.data.username || "",
        email: profileResponse.data.email ?? null,
        first_name: profileResponse.data.first_name || "",
        last_name: profileResponse.data.last_name || "",
        is_moderator:
          profileResponse.data.is_moderator === "True" ||
          profileResponse.data.is_moderator === true,
      };

      dispatch(updateProfileSuccess(updatedUser));
      setSuccessMessage("Профиль успешно обновлён!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      dispatch(
        updateProfileFailure(err.response?.data?.error || "Ошибка обновления профиля")
      );
    }
  };

  // 👇 Обработчики для формы пароля
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError(null);
    setPasswordSuccess(null);
    dispatch(clearError());
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Валидация на фронтенде
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("Новые пароли не совпадают");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError("Пароль должен быть не менее 8 символов");
      return;
    }

    dispatch(changePasswordStart());

    try {
      // 👇 Прямой вызов axios для смены пароля (без thunk)
      await axios.put(
        "http://localhost:8000/api/users/profile/",
        {
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
          },
        }
      );

      dispatch(changePasswordSuccess());
      setPasswordSuccess("Пароль успешно изменён!");
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      const backendError = err.response?.data;
      let message = "Ошибка смены пароля";

      if (backendError?.old_password) {
        if (Array.isArray(backendError.old_password)) {
          message = backendError.old_password[0];
        } else if (typeof backendError.old_password === "string") {
          message = backendError.old_password;
        }
      } else if (backendError?.error) {
        message = backendError.error;
      }

      dispatch(changePasswordFailure(message));
      setPasswordError(message);
    }
  };

  // 👇 Выход из системы
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/users/logout/",
        {},
        {
          withCredentials: true,
          headers: {
            ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
          },
        }
      );
      dispatch(logoutSuccess());
      navigate("/");
    } catch (err: any) {
      console.error("Ошибка при выходе:", err);
    }
  };

  // 👇 Сброс сообщений при переключении вкладок
  const handleTabChange = (tab: "profile" | "password") => {
    setActiveTab(tab);
    setSuccessMessage(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    dispatch(clearError());
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <Breadcrumbs
          paths={[
            { name: "Главная", link: "/" },
            { name: "Личный кабинет" },
          ]}
        />
        <div className="not-found-message">
          <h2>⚠️ Пожалуйста, войдите в систему</h2>
          <Link to="/login" className="btn">
            Войти
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
          { name: "Личный кабинет" },
        ]}
      />

      <h1 className="auth-form-title">Личный кабинет</h1>

      {/* 👇 Вкладки: Профиль / Смена пароля / Выйти (вертикально) */}
      <div className="profile-tabs-vertical">
        <button
          className={`tab-btn-vertical ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => handleTabChange("profile")}
        >
          Профиль
        </button>
        <button
          className={`tab-btn-vertical ${activeTab === "password" ? "active" : ""}`}
          onClick={() => handleTabChange("password")}
        >
          Смена пароля
        </button>
        <button
          className="tab-btn-vertical"
          onClick={handleLogout}
          style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
        >
          Выйти
        </button>
      </div>

      {/* 👇 Сообщения об ошибках/успехе */}
      {error && activeTab === "profile" && (
        <div className="alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => dispatch(clearError())}
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

      {passwordError && (
        <div className="alert-error" role="alert">
          <span>{passwordError}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setPasswordError(null)}
          >
            ×
          </button>
        </div>
      )}

      {passwordSuccess && (
        <div className="alert-success" role="alert">
          <span>{passwordSuccess}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setPasswordSuccess(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* 👇 Форма профиля */}
      {activeTab === "profile" && (
        <div className="auth-form-container">
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Имя пользователя</label>
              <input
                type="text"
                className="form-input"
                value={user?.username || ""}
                disabled
                title="Имя пользователя нельзя изменить"
              />
              <small className="form-text text-muted">
                Имя пользователя нельзя изменить
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                Имя
              </label>
              <input
                type="text"
                className="form-input"
                id="first_name"
                name="first_name"
                value={profileData.first_name}
                onChange={handleProfileChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                Фамилия
              </label>
              <input
                type="text"
                className="form-input"
                id="last_name"
                name="last_name"
                value={profileData.last_name}
                onChange={handleProfileChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-input"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-auth-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Сохранение...
                </>
              ) : (
                "Сохранить изменения"
              )}
            </button>
          </form>
        </div>
      )}

      {/* 👇 Форма смены пароля */}
      {activeTab === "password" && (
        <div className="auth-form-container">
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="old_password" className="form-label">
                Текущий пароль *
              </label>
              <input
                type="password"
                className="form-input"
                id="old_password"
                name="old_password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password" className="form-label">
                Новый пароль *
              </label>
              <input
                type="password"
                className="form-input"
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                disabled={loading}
                minLength={8}
                autoComplete="new-password"
              />
              <small className="form-text text-muted">
                Минимум 8 символов
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password" className="form-label">
                Подтвердите новый пароль *
              </label>
              <input
                type="password"
                className="form-input"
                id="confirm_password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn-auth-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Сменить пароль
                </>
              ) : (
                "Сменить пароль"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};