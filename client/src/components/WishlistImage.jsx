import { useRef, useState } from 'react';
import { Download, X, ZoomIn } from 'lucide-react';

export default function WishlistImage({ image, nickname }) {
  const dialog = useRef(null);
  const [failedImage, setFailedImage] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  async function downloadPng() {
    setDownloading(true);
    setDownloadError('');
    try {
      const source = new Image();
      source.src = image;
      await source.decode();
      const canvas = document.createElement('canvas');
      canvas.width = source.naturalWidth;
      canvas.height = source.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image downloads are unavailable in this browser.');
      context.drawImage(source, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('The PNG could not be prepared. Please try again.');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(nickname || 'child').replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase()}-wishlist.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      setDownloadError(error.message || 'The wishlist could not be downloaded. Please try again.');
    } finally { setDownloading(false); }
  }

  const downloadButton = <button type="button" className="brand-button wishlist-download-button" onClick={downloadPng} disabled={downloading}><Download size={18} aria-hidden="true" />{downloading ? 'Preparing PNG…' : 'Download wishlist PNG'}</button>;
  if (!image || failedImage === image) return <div className="wishlist-image-empty" role="status">{image ? 'The wishlist image could not be loaded.' : 'The wishlist image will be available soon.'}</div>;
  return <>
    <button type="button" className="wishlist-image-button" onClick={() => dialog.current.showModal()} aria-label={`Enlarge ${nickname}'s wishlist`}>
      <img src={image} alt={`${nickname}'s anonymized wishlist`} onError={() => setFailedImage(image)} />
      <span><ZoomIn size={17} aria-hidden="true" /> Click to enlarge</span>
    </button>
    {downloadButton}
    {downloadError && <p role="alert">{downloadError}</p>}
    <dialog ref={dialog} className="child-profile-dialog" aria-label={`${nickname}'s wishlist image`} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="child-profile-dialog-content">
        <button type="button" className="child-profile-close" aria-label="Close wishlist image" autoFocus onClick={() => dialog.current.close()}><X size={22} /></button>
        <h2>{nickname}'s wishlist</h2>
        <img className="child-profile-worksheet" src={image} alt={`${nickname}'s anonymized wishlist, enlarged`} />
        {downloadButton}
        {downloadError && <p role="alert">{downloadError}</p>}
      </div>
    </dialog>
  </>;
}
