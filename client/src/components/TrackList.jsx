export default function TrackList({ tracks }) {
  return (
    <ol className="item-list">
      {tracks.map((track) => (
        <li key={track.id} className="item-row">
          {track.albumImage && <img src={track.albumImage} alt="" className="thumb" />}
          <div>
            <a href={track.url} target="_blank" rel="noreferrer" className="item-title">
              {track.name}
            </a>
            <div className="item-subtitle">{track.artists}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
