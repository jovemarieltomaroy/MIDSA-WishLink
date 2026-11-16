import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Download } from 'lucide-react';
import QrGiftTag from './QrGiftTag';
import { api, getErrorMessage } from '../utils/api';
import { downloadBlob, qrTagPng } from '../utils/downloadQrTag';
import { tagZip } from '../utils/tagZip';

const safeName = value => String(value).replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase();

export default function CampaignTagDownload({ campaignId, campaignName }) {
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  async function downloadAll() {
    setError('');
    setProgress('Loading tags…');
    try {
      const { data } = await api.get('/officer/wishes', { params: { campaignId } });
      if (!data.wishes.length) throw new Error('This campaign has no tags to download yet.');
      const files = [];
      const baseUrl = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '');
      for (const [index, wish] of data.wishes.entries()) {
        setProgress(`Preparing tag ${index + 1} of ${data.wishes.length}…`);
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
      setProgress('Preparing ZIP…');
      downloadBlob(await tagZip(files), `${safeName(campaignName)}-tags.zip`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProgress('');
    }
  }

  return <div>
    <button type="button" className="secondary-button" disabled={Boolean(progress)} onClick={downloadAll}>
      <Download size={17} />{progress || 'Download all tag PNGs (ZIP)'}
    </button>
    {progress && <span className="sr-only" role="status">{progress}</span>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
