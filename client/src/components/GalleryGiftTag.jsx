import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import letterLogo from '../assets/branding/logobranded.png';

export default function GalleryGiftTag() {
  const galleryUrl = new URL('/gallery', window.location.origin).href;
  return <Link className="gallery-gift-tag" to="/gallery" aria-label="View the gallery of wishes">
    <span className="gallery-tag-top" aria-hidden="true"><span /></span>
    <div className="gallery-tag-frame">
      <div className="gallery-tag-paper">
        <span className="brand-kicker">HOLIDAY WISHES</span>
        <strong className="gallery-tag-name">MIDSA</strong>
        <QRCodeSVG value={galleryUrl} size={224} level="H" marginSize={4} bgColor="#ffffff" fgColor="#152b22" imageSettings={{ src: letterLogo, width: 64, height: 64, excavate: true }} title="Scan to view the gallery of wishes" />
        <span className="gallery-tag-caption">Scan to view the<br />gallery of wishes</span>
      </div>
    </div>
  </Link>;
}
