import { useEffect, useState } from 'react';
import { Gift, MapPin } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import WishlistImage from '../components/WishlistImage';
import { api, getErrorMessage } from '../utils/api';

const formatDate = value => value ? new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not scheduled';

export default function ReservationPage() {
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const token = window.location.hash.replace(/^#(?:reservation=)?/, '');
    api.post('/public/reservation/view', { token }).then(response => setReservation(response.data.reservation)).catch(err => setError(getErrorMessage(err)));
  }, []);

  return <PublicLayout>
    <main className="reservation-view">
      {error ? <div className="reservation-panel" role="alert">{error}</div> : !reservation ? <div className="reservation-panel" role="status">Loading your reservation...</div> : <>
        <section className="reservation-panel reservation-main">
          <span className="reservation-badge">{reservation.status === 'granted' ? 'Wish granted' : 'Reservation confirmed'}</span>
          <h1>You're {reservation.nickname}'s holiday donor.</h1>
          <p>Your reservation details are shown below. Contact the team if your plans change.</p>
          <dl className="reservation-details">
            <div><dt>Scheduled drop-off</dt><dd>{formatDate(reservation.scheduledDropOffAt)}</dd></div>
            <div><dt>Latest drop-off</dt><dd>{formatDate(reservation.reservationExpiresAt)}</dd></div>
            <div><dt>Location</dt><dd>{reservation.organization.dropOffLocation}</dd></div>
            <div><dt>Contact</dt><dd><a href={`mailto:${reservation.organization.contactEmail}`}>{reservation.organization.contactEmail}</a>{reservation.organization.messengerUrl && <> · <a href={reservation.organization.messengerUrl} target="_blank" rel="noreferrer">Message us on Messenger</a></>}</dd></div>
          </dl>
        </section>
        <div className="reservation-side">
          <section className="reservation-panel"><h2><Gift size={21} /> {reservation.nickname}'s wishlist</h2><WishlistImage image={reservation.worksheetImage} nickname={reservation.nickname} />{reservation.wishItems?.length > 0 && <ul>{reservation.wishItems.map((item, index) => <li key={index}>{item}</li>)}</ul>}<p>Choose any wish that fits your budget. There is no expectation to fulfill everything.</p></section>
          <section className="reservation-panel"><h2><MapPin size={21} /> Gift drop-off</h2><p>{reservation.organization.dropOffLocation}</p></section>
        </div>
      </>}
    </main>
    <style>{`
      .reservation-view { width: min(1200px, calc(100% - 40px)); margin: 40px auto; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
      .reservation-panel { padding: 30px; background: #fffcf4; border: 1px solid #e0d9c8; border-radius: 15px; box-shadow: 0 8px 24px #173b2310; color: #243e32; }
      .reservation-main { border-top: 5px solid #086747; }
      .reservation-main h1 { font-size: clamp(28px, 4vw, 42px); margin: 16px 0; }
      .reservation-panel h2 { display: flex; align-items: center; gap: 10px; color: #07553d; font-size: 20px; }
      .reservation-panel p { line-height: 1.6; }
      .reservation-badge { display: inline-block; padding: 8px 14px; border-radius: 30px; background: #e9f4e9; color: #086747; font-weight: 700; }
      .reservation-details { margin: 25px 0; padding: 20px; border-radius: 12px; background: #f1f6f2; }
      .reservation-details div { display: grid; grid-template-columns: 150px 1fr; gap: 10px; padding: 8px 0; }
      .reservation-details dt { font-weight: 700; }.reservation-details dd { margin: 0; overflow-wrap: anywhere; }
      .reservation-side { display: grid; gap: 20px; }
      @media (max-width: 700px) { .reservation-view { grid-template-columns: 1fr; }.reservation-details div { grid-template-columns: 1fr; gap: 3px; } }
    `}</style>
  </PublicLayout>;
}
