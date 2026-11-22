import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import QrGiftTag from '../components/QrGiftTag';
import { api, getErrorMessage } from '../utils/api';

const groups = [
  { status: 'available', title: 'Waiting for a donor', description: 'These wishes are ready for a little holiday kindness.' },
  { status: 'reserved', title: 'Reserved', description: 'A donor is already preparing these gifts.' },
  { status: 'granted', title: 'Granted', description: 'Holiday wishes that have come true.' },
];

function WishGroup({ status, title, description }) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setResult(null);
    setError('');
    api.get('/public/wishes', { params: { page, status } })
      .then(({ data }) => {
        if (active) setResult({ ...data, wishes: data.wishes.filter(wish => wish.status === status) });
      })
      .catch(err => { if (active) setError(err.response?.status === 404
        ? 'The wishes gallery is temporarily unavailable. Please try again shortly.'
        : getErrorMessage(err)); });
    return () => { active = false; };
  }, [page, status, attempt]);
  return <section id={`gallery-${status}`} className={`gallery-group gallery-group-${status}`} aria-labelledby={`gallery-${status}-title`}>
    <div className="gallery-group-heading"><h2 id={`gallery-${status}-title`}>{title}</h2><p>{description}</p></div>
    {error ? <div className="gallery-message" role="alert"><p>{error}</p><button className="brand-button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>
      : !result ? <p role="status">Loading wishes…</p>
      : result.wishes.length === 0 ? <p className="gallery-empty">{status === 'available' ? 'No wishes waiting for a donor just yet. Check back soon!' : `No ${title.toLowerCase()} wishes yet.`}</p>
      : <>
        <div className="wish-gallery-grid">{result.wishes.map(wish => (
          <Link key={wish.ornamentCode} className="gallery-wish-tag" to={`/wish/${encodeURIComponent(wish.ornamentCode)}`} aria-label={`View ${wish.nickname}'s wish`}>
            <QrGiftTag showCord nickname={wish.nickname} wishItems={wish.wishItems} code={wish.ornamentCode} idPrefix={`gallery-${wish.ornamentCode}`} value={new URL(`/wish/${encodeURIComponent(wish.ornamentCode)}`, window.location.origin).href} />
          </Link>
        ))}</div>
        {result.pages > 1 && <nav className="gallery-pagination" aria-label={`${title} pages`}><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {result.pages}</span><button disabled={page >= result.pages} onClick={() => setPage(value => value + 1)}>Next</button></nav>}
      </>}
  </section>;
}

export default function WishGalleryPage() {
  return <PublicLayout stickyHeader showCountdown><main className="wish-gallery">
    <div className="brand-section-heading"><span className="brand-kicker">A LITTLE HOLIDAY KINDNESS</span><h1>Gallery of wishes</h1><p>Find a wish to fulfill, wherever you are. Tap a tag or scan its QR code to view the wish.</p></div>
    {groups.map(group => <WishGroup key={group.status} {...group} />)}
  </main></PublicLayout>;
}
