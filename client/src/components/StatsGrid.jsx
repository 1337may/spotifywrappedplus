import { useLanguage } from "../i18n.jsx";

export default function StatsGrid({ stats, range }) {
  const { t } = useLanguage();

  const tiles = [
    { label: t("statUniqueArtists"), value: stats.uniqueArtistsCount },
    ...(range === "long_term"
      ? []
      : [{ label: t("statNewArtists"), value: stats.newArtistsCount }]),
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
