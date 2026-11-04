function asDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The tag artwork could not be loaded.'));
    reader.readAsDataURL(blob);
  });
}

export async function downloadQrTag(svg, filename) {
  if (!svg) throw new Error('QR tag could not be prepared for download.');
  const copy = svg.cloneNode(true);
  // Embed the artwork so the exported SVG is self-contained before rasterizing.
  for (const image of copy.querySelectorAll('image')) {
    const response = await fetch(image.getAttribute('href'));
    if (!response.ok) throw new Error('The tag artwork could not be loaded.');
    image.setAttribute('href', await asDataUrl(await response.blob()));
  }
  copy.setAttribute('width', '1412');
  const height = Math.round(svg.viewBox.baseVal.height * 2);
  copy.setAttribute('height', String(height));
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 1412;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('PNG export is unavailable in this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('QR tag could not be downloaded.');
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
