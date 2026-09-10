export default function GenreChart({ genres }) {
  return (
    <div className="genre-chart">
      {genres.map(({ genre, percent }) => (
        <div key={genre} className="genre-row">
          <span className="genre-label">{genre}</span>
          <div className="genre-bar-track">
            <div className="genre-bar-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="genre-percent">{percent}%</span>
        </div>
      ))}
    </div>
  );
}
