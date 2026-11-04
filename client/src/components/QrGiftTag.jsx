import { QRCodeSVG } from 'qrcode.react';
import { getTagDesign } from '../utils/tagDesigns';

function nameLines(name) {
  const words = String(name).trim().split(/\s+/);
  const lines = [''];
  for (const word of words) {
    const last = lines.length - 1;
    if (lines[last] && `${lines[last]} ${word}`.length > 20) lines.push(word);
    else lines[last] = `${lines[last]} ${word}`.trim();
  }
  return lines;
}

export default function QrGiftTag({ value, nickname, code, idPrefix = 'wish', showCord = false }) {
  const design = getTagDesign(code);
  const cordColor = { striped: '#ac3025', dotted: '#086747', tartan: '#b78b39', vertical: '#ac3025', red: '#fffaf0', bow: '#b78b39', candy: '#fffaf0' }[design.id] || '#ac3025';
  const height = Math.round(706 * design.height / design.width);
  const top = design.top * 706;
  const available = height - top - 90;
  const qrSize = Math.min(420, Math.floor(available - 310));
  const qrY = top + 150;
  const captionY = qrY + qrSize + 44;
  const lines = nameLines(nickname);
  const fontSize = Math.min(46, 70 / lines.length);
  const cordHeight = showCord ? 150 : 0;
  return <svg id={`${idPrefix}-qr-tag`} data-tag-design={design.id} className="qr-gift-tag" xmlns="http://www.w3.org/2000/svg" viewBox={`0 ${-cordHeight} 706 ${height + cordHeight}`} width="706" height={height + cordHeight} role="img" aria-labelledby={`${idPrefix}-qr-tag-title`}>
    <title id={`${idPrefix}-qr-tag-title`}>Scan to view and reserve {nickname}'s wish</title>
    <image href={design.image} width="706" height={height} />
    {showCord && <g fill="none" stroke={cordColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ filter: 'drop-shadow(0 1px 1px #38311d55)' }}>
      <path d="M338 -132 C308 -106 365 -68 344 -28 C332 0 364 29 353 70 C350 82 342 80 343 67 C345 45 354 14 349 -7 C340 -49 365 -88 379 -114" />
      <path d="M349 -24 C320 -32 319 4 342 0 C365 -5 369 -30 349 -24 Z" />
    </g>}
    <g textAnchor="middle" fontFamily="Arial, sans-serif" fill={design.ink || '#07593f'}>
      <text x="353" y={top + 18} fontSize="19" letterSpacing="3">CHRISTMAS WISH</text>
      {lines.map((line, index) => <text key={index} x="353" y={top + 65 + index * fontSize * 1.15} fontSize={fontSize} fontWeight="700" textLength={line.length > 18 ? 410 : undefined} lengthAdjust="spacingAndGlyphs">{line}</text>)}
      <text x="353" y={captionY} fontSize="25" fontWeight="700">Scan to view</text>
      <text x="353" y={captionY + 36} fontSize="25" fontWeight="700">and reserve this wish</text>
      <text x="353" y={captionY + 96} fontSize="17" letterSpacing="1">{code}</text>
    </g>
    <QRCodeSVG id={`${idPrefix}-qr-code`} x={(706 - qrSize) / 2} y={qrY} value={value} size={qrSize} level="M" marginSize={4} bgColor="#ffffff" fgColor="#000000" />
  </svg>;
}
