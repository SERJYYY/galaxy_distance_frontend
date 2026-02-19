// src/pages/LoginPage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  loginStart,
  loginSuccess,
  loginFailure,
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

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      // 👇 Прямой вызов axios (без api.users.usersLoginCreate)
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

      // После успешного входа загружаем профиль
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

      dispatch(loginSuccess(user));
      navigate("/");
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Неправильный логин или пароль";
      dispatch(loginFailure(message));
    }
  };

  return (
    <div className="container py-5">
      <div className="auth-form-container">
        <h1 className="auth-form-title">Вход</h1>

        {error && (
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Имя пользователя
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
            <label htmlFor="password" className="form-label">
              Пароль
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
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted">Нет аккаунта? </span>
            <Link to="/register">Зарегистрироваться</Link>
          </div>
        </form>
      </div>
    </div>
  );
};