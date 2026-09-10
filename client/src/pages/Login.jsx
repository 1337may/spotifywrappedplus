import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated } from "../api.js";
import { useLanguage } from "../i18n.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";

const KNOWN_ERRORS = ["state_mismatch", "access_denied", "token_exchange_failed", "missing_credentials"];

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
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
      <LanguageSwitcher />
      <h1>{t("appTitle")}</h1>
      <p>{t("loginSubtitle")}</p>
      {error && (
        <p className="error">{t(KNOWN_ERRORS.includes(error) ? `error_${error}` : "error_generic")}</p>
      )}

      <div className="setup-box">
        <p>{t("setupIntro")}</p>
        <ol>
          <li>
            {t("setupStep1")}{" "}
            <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
              developer.spotify.com/dashboard
            </a>{" "}
            {t("setupStep1End")}
          </li>
          <li>{t("setupStep2")}</li>
          <li>
            {t("setupStep3")}
            <br />
            <code>{redirectUri}</code>
          </li>
          <li>{t("setupStep4")}</li>
        </ol>

        <form method="POST" action="/login" className="creds-form">
          <input
            type="text"
            name="client_id"
            placeholder={t("clientIdPlaceholder")}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          />
          <input
            type="password"
            name="client_secret"
            placeholder={t("clientSecretPlaceholder")}
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            required
          />
          <button type="submit" className="spotify-button">
            {t("loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
