const labels = {
  available: 'Waiting for a Santa',
  reserved: 'Santa on the Way',
  granted: 'Wish Granted',
  paused: 'Temporarily Hidden'
};
export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}
