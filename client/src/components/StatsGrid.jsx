import { useLanguage } from "../i18n.jsx";

export default function StatsGrid({ stats }) {
  const { t } = useLanguage();

  const tiles = [
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
