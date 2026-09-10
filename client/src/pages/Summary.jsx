import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { consumeTokensFromUrlHash, getSummary, isAuthenticated, logout } from "../api.js";
import TrackList from "../components/TrackList.jsx";
import ArtistList from "../components/ArtistList.jsx";
import GenreChart from "../components/GenreChart.jsx";

const RANGES = [
  { value: "short_term", label: "4 недели" },
  { value: "medium_term", label: "6 месяцев" },
  { value: "long_term", label: "Всё время" },
];

export default function Summary() {
  const [range, setRange] = useState("medium_term");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          setError("Не удалось загрузить данные из Spotify.");
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
        <h1>Ваша выжимка</h1>
        <button className="link-button" onClick={handleLogout}>
          Выйти
        </button>
      </header>

      <div className="range-tabs">
        {RANGES.map((r) => (
          <button
            key={r.value}
            className={r.value === range ? "tab active" : "tab"}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className="error">{error}</p>}

      {data && !loading && (
        <div className="summary-grid">
          <section>
            <h2>Топ треков</h2>
            <TrackList tracks={data.topTracks.slice(0, 20)} />
          </section>
          <section>
            <h2>Топ исполнителей</h2>
            <ArtistList artists={data.topArtists.slice(0, 20)} />
          </section>
          <section>
            <h2>Топ жанров</h2>
            <GenreChart genres={data.topGenres} />
          </section>
        </div>
      )}
    </div>
  );
}
