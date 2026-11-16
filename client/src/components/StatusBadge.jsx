const labels = {
  available: 'Waiting for a donor',
  reserved: 'Gift on the way',
  granted: 'Wish Granted',
  paused: 'Temporarily Hidden'
};
export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}
