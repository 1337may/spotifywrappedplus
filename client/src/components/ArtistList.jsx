export default function ArtistList({ artists }) {
  return (
    <ol className="item-list">
      {artists.map((artist) => (
        <li key={artist.id} className="item-row">
          {artist.image && <img src={artist.image} alt="" className="thumb round" />}
          <a href={artist.url} target="_blank" rel="noreferrer" className="item-title">
            {artist.name}
          </a>
        </li>
      ))}
    </ol>
  );
}
