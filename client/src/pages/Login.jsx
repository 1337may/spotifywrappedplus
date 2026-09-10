import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated } from "../api.js";

const ERROR_MESSAGES = {
  state_mismatch: "Не удалось проверить запрос авторизации, попробуйте ещё раз.",
  access_denied: "Доступ к Spotify не был предоставлен.",
  token_exchange_failed: "Не удалось завершить авторизацию в Spotify.",
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/summary", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="page centered">
      <h1>Spotify Taste Summary</h1>
      <p>Узнайте свои любимые треки, исполнителей и жанры.</p>
      {error && <p className="error">{ERROR_MESSAGES[error] ?? "Что-то пошло не так."}</p>}
      <a className="spotify-button" href="/login">
        Войти через Spotify
      </a>
    </div>
  );
}
