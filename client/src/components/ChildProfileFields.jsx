import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

async function readWorksheet(file) {
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The image could not be read. Please try again.'));
    reader.readAsDataURL(file);
  });
  const image = new Image();
  image.src = source;
  await image.decode();
  if (file.size <= 600 * 1024) return source;

  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 2200 / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
    const result = canvas.toDataURL('image/jpeg', quality);
    if (result.length <= 819200) return result;
  }
  throw new Error('This image is still too large after compression. Try a smaller image.');
}

export default function ChildProfileFields({ value = {}, onChange }) {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filename, setFilename] = useState('');
  const input = useRef(null);
  const set = (key, next) => onChange({ ...value, [key]: next });
  async function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please choose a JPEG, PNG, or WebP image. PDF files must be exported as an image first.');
      event.target.value = '';
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Please choose an image under 20 MB.');
      event.target.value = '';
      return;
    }
    setProcessing(true);
    try {
      const image = await readWorksheet(file);
      set('worksheetImage', image);
      setFilename(file.name);
    } catch (err) {
      setError(err.message || 'The image could not be read. Please try again.');
      if (input.current) input.current.value = '';
    } finally { setProcessing(false); }
  }
  return <fieldset className="child-profile-fields new-wish-full">
    <legend>Wishlist image <span className="worksheet-optional">(optional)</span></legend>
    <p className="worksheet-intro">Upload the cleaned worksheet that donors will see.</p>
    <div className={`worksheet-upload-layout${value.worksheetImage ? ' has-preview' : ''}`}>
      <div className="worksheet-upload-controls">
        <label className="worksheet-upload-area">
          <span className="worksheet-upload-heading"><ImagePlus size={22} aria-hidden="true" /> Choose a worksheet image</span>
          <span className="worksheet-file-hint">JPEG, PNG, or WebP · Up to 20 MB</span>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={processing} onChange={chooseImage} />
        </label>
        <div className="worksheet-upload-guidance">
          <p><strong>Before uploading:</strong> Permanently remove the name, drawing, signature, and identifying details.</p>
          <p>Large images are compressed automatically. Export PDF files as an image first.</p>
        </div>
        {processing && <p role="status">Preparing your worksheet image…</p>}
        {error && <div className="alert" role="alert">{error}</div>}
      </div>
      {value.worksheetImage && <div className="worksheet-preview-panel"><img className="child-profile-preview" src={value.worksheetImage} alt="Donor worksheet preview" /><p role="status">{filename || 'Worksheet image'} added. Save the wish to keep this image.</p><button type="button" className="text-button" disabled={processing} onClick={() => { set('worksheetImage', ''); setFilename(''); setError(''); if (input.current) input.current.value = ''; }}><Trash2 size={16} aria-hidden="true" /> Remove image</button></div>}
    </div>
  </fieldset>;
}
