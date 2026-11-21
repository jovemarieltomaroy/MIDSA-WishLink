import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Download } from 'lucide-react';
import QrGiftTag from './QrGiftTag';
import { api, getErrorMessage } from '../utils/api';
import { downloadBlob, qrTagPng } from '../utils/downloadQrTag';
import { tagZip } from '../utils/tagZip';

const safeName = value => String(value).replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase();

export default function CampaignTagDownload({ campaignId, campaignName }) {
  const [wishes, setWishes] = useState(null);
  const [selected, setSelected] = useState([]);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  async function chooseTags() {
    setError('');
    setProgress('Loading wishes...');
    try {
      const { data } = await api.get('/officer/wishes', { params: { campaignId } });
      setWishes(data.wishes);
      setSelected([]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProgress('');
    }
  }

  async function downloadSelected() {
    const chosen = wishes.filter(wish => selected.includes(wish._id));
    if (!chosen.length) return;
    setError('');
    try {
      const files = [];
      const baseUrl = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '');
      for (const [index, wish] of chosen.entries()) {
        setProgress(`Preparing tag ${index + 1} of ${chosen.length}...`);
        const markup = renderToStaticMarkup(<QrGiftTag
          value={`${baseUrl}/wish/${wish.ornamentCode}`}
          nickname={wish.nickname} code={wish.ornamentCode}
          idPrefix={`export-${index}`} />);
        const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;
        files.push({
          name: `${index + 1}-${safeName(wish.nickname)}-${safeName(wish.ornamentCode)}-qr-tag.png`,
          blob: await qrTagPng(svg),
        });
      }
      setProgress('Preparing ZIP...');
      downloadBlob(await tagZip(files), `${safeName(campaignName)}-tags.zip`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProgress('');
    }
  }

  return <div>
    {!wishes && <button type="button" className="secondary-button" disabled={Boolean(progress)} onClick={chooseTags}>
      <Download size={17} /> Choose wish QR tags
    </button>}
    {wishes && <div>
      {wishes.length === 0 ? <p>This campaign has no tags to download yet.</p> : <>
        <p>Select the wishes you want to download.</p>
        <button type="button" className="secondary-button" disabled={Boolean(progress)} onClick={() => setSelected(selected.length === wishes.length ? [] : wishes.map(wish => wish._id))}>
          {selected.length === wishes.length ? 'Clear selection' : 'Select all'}
        </button>
        <fieldset disabled={Boolean(progress)} style={{ maxHeight: '240px', overflowY: 'auto', margin: '12px 0' }}>
          <legend>Wish QR tags</legend>
          {wishes.map(wish => <label key={wish._id} style={{ display: 'block', padding: '4px 0' }}>
            <input type="checkbox" checked={selected.includes(wish._id)} onChange={event => setSelected(current => event.target.checked ? [...current, wish._id] : current.filter(id => id !== wish._id))} />{' '}
            {wish.nickname} ({wish.ornamentCode})
          </label>)}
        </fieldset>
        <button type="button" className="secondary-button" disabled={Boolean(progress) || !selected.length} onClick={downloadSelected}>
          <Download size={17} /> {progress || `Download selected (${selected.length}) as ZIP`}
        </button>
      </>}
      <button type="button" className="secondary-button" disabled={Boolean(progress)} onClick={() => setWishes(null)}>Close</button>
    </div>}
    {progress && <span className="sr-only" role="status">{progress}</span>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
