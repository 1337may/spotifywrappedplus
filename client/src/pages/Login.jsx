import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated } from "../api.js";

const ERROR_MESSAGES = {
  state_mismatch: "Не удалось проверить запрос авторизации, попробуйте ещё раз.",
  access_denied: "Доступ к Spotify не был предоставлен.",
  token_exchange_failed: "Не удалось завершить авторизацию в Spotify.",
  missing_credentials: "Введите Client ID и Client Secret.",
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const redirectUri = `${window.location.origin}/callback`;

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/summary", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="page centered">
      <h1>Spotify Taste Summary</h1>
      <p>Узнайте свои любимые треки и исполнителей.</p>
      {error && <p className="error">{ERROR_MESSAGES[error] ?? "Что-то пошло не так."}</p>}

      <div className="setup-box">
        <p>
          Из-за ограничений Spotify (Development Mode, до 5 пользователей на приложение) у каждого
          посетителя должно быть своё Spotify-приложение. Это бесплатно и занимает пару минут:
        </p>
        <ol>
          <li>
            Откройте{" "}
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
              developer.spotify.com/dashboard
            </a>{" "}
            и нажмите Create app
          </li>
          <li>Впишите любое название (не начинающееся на «Spot») и описание</li>
          <li>
            В поле Redirect URIs добавьте ровно:
            <br />
            <code>{redirectUri}</code>
          </li>
          <li>Сохраните и откройте Settings приложения — там будут Client ID и Client Secret</li>
        </ol>

        <form method="POST" action="/login" className="creds-form">
          <input
            type="text"
            name="client_id"
            placeholder="Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          />
          <input
            type="password"
            name="client_secret"
            placeholder="Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            required
          />
          <button type="submit" className="spotify-button">
            Войти через Spotify
          </button>
        </form>
      </div>
    </div>
  );
}
