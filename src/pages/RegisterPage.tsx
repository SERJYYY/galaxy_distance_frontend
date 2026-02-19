// src/pages/RegisterPage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  registerStart,
  registerSuccess,
  registerFailure,
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

export const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError(null);
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearError());

    // Валидация на фронтенде
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Пароли не совпадают");
      return;
    }

    if (formData.password.length < 8) {
      setValidationError("Пароль должен быть не менее 8 символов");
      return;
    }

    dispatch(registerStart());

    try {
      // 👇 Прямой вызов регистрации через axios (без кодогенерации)
      await axios.post(
        "http://localhost:8000/api/users/register/",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
          },
        }
      );

      // После регистрации — автоматически входим
      await axios.post(
        "http://localhost:8000/api/users/login/",
        {
          username: formData.username,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
          },
        }
      );

      // Загружаем профиль
      const profileResponse = await axios.get(
        "http://localhost:8000/api/users/profile/",
        {
          withCredentials: true,
          headers: {
            ...(getCsrfToken() && { "X-CSRFToken": getCsrfToken() }),
          },
        }
      );

      const user: AuthUser = {
        id: profileResponse.data.id || 0,
        username: profileResponse.data.username || "",
        email: profileResponse.data.email ?? null,
        first_name: profileResponse.data.first_name || "",
        last_name: profileResponse.data.last_name || "",
        is_moderator:
          profileResponse.data.is_moderator === "True" ||
          profileResponse.data.is_moderator === true,
      };

      dispatch(registerSuccess(user));
      navigate("/");
    } catch (err: any) {
      const backendError = err.response?.data;
      let message = "Ошибка регистрации";

      if (typeof backendError === "object" && backendError !== null) {
        const messages = Object.values(backendError)
          .flat()
          .filter((v: any) => typeof v === "string")
          .join(", ");
        if (messages) message = messages;
      } else if (backendError?.error) {
        message = backendError.error;
      }

      dispatch(registerFailure(message));
    }
  };

  return (
    <div className="container py-5">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Регистрация</h1>

        {error && (
          <div className="alert-error" role="alert">
            <span>
              {typeof error === "object"
                ? Object.values(error as any).flat().join(", ")
                : error}
            </span>
            <button
              type="button"
              className="alert-close"
              onClick={() => dispatch(clearError())}
            >
              ×
            </button>
          </div>
        )}

        {validationError && (
          <div className="alert-warning" role="alert">
            <span>{validationError}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setValidationError(null)}
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Имя пользователя *
            </label>
            <input
              type="text"
              className="form-input"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
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
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль *
            </label>
            <input
              type="password"
              className="form-input"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Подтвердите пароль *
            </label>
            <input
              type="password"
              className="form-input"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
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
                  aria-hidden="true"
                />
                Регистрация...
              </>
            ) : (
              "Зарегистрироваться"
            )}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted">Уже есть аккаунт? </span>
            <Link to="/login">Войти</Link>
          </div>
        </form>
      </div>
    </div>
  );
};