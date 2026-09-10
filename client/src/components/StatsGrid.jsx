import { useLanguage } from "../i18n.jsx";

function formatDuration(totalMinutes, t) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} ${t("minutesSuffix")}`;
  return `${hours} ${t("hoursSuffix")} ${minutes} ${t("minutesSuffix")}`;
}

export default function StatsGrid({ stats }) {
  const { t } = useLanguage();

  const tiles = [
    { label: t("statListeningTime"), value: formatDuration(stats.totalMinutes, t) },
    { label: t("statUniqueArtists"), value: stats.uniqueArtistsCount },
    { label: t("statExplicit"), value: `${stats.explicitPercent}%` },
  ];

  return (
    <div className="stats-grid">
      {tiles.map((tile) => (
        <div key={tile.label} className="stat-tile">
          <div className="stat-value">{tile.value}</div>
          <div className="stat-label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
