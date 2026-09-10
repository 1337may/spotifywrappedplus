import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { consumeTokensFromUrlHash, getSummary, isAuthenticated, logout } from "../api.js";
import TrackList from "../components/TrackList.jsx";
import ArtistList from "../components/ArtistList.jsx";
import StatsGrid from "../components/StatsGrid.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import { useLanguage } from "../i18n.jsx";

const RANGES = ["short_term", "medium_term", "long_term"];

export default function Summary() {
  const [range, setRange] = useState("medium_term");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    consumeTokensFromUrlHash();
    if (!isAuthenticated()) {
      navigate("/", { replace: true });
      return;
    }

    setLoading(true);
    setError(null);
    getSummary(range)
      .then(setData)
      .catch((err) => {
        if (err.status === 401) {
          logout();
          navigate("/", { replace: true });
        } else {
          setError(t("summaryError"));
        }
      })
      .finally(() => setLoading(false));
  }, [range, navigate]);

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="page">
      <header className="summary-header">
        <div className="profile-row">
          {data?.profile?.image && <img src={data.profile.image} alt="" className="thumb round" />}
          <h1>
            {data?.profile?.displayName ? `${t("greeting")}, ${data.profile.displayName}!` : t("summaryTitle")}
          </h1>
        </div>
        <div className="header-actions">
          <LanguageSwitcher />
          <button className="link-button" onClick={handleLogout}>
            {t("logout")}
          </button>
        </div>
      </header>

      <div className="range-tabs">
        {RANGES.map((r) => (
          <button
            key={r}
            className={r === range ? "tab active" : "tab"}
            onClick={() => setRange(r)}
          >
            {t(`range_${r}`)}
          </button>
        ))}
      </div>

      {loading && <p>{t("loading")}</p>}
      {error && <p className="error">{error}</p>}

      {data && !loading && (
        <>
          <StatsGrid stats={data.stats} range={range} />
          <div className="summary-grid">
            <section>
              <h2>{t("topTracks")}</h2>
              <TrackList tracks={data.topTracks.slice(0, 20)} />
            </section>
            <section>
              <h2>{t("topArtists")}</h2>
              <ArtistList artists={data.topArtists.slice(0, 20)} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
