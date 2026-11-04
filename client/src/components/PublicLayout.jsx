import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import logo from '../assets/branding/campaign-logo-transparent.png';
import footerLogo from '../assets/branding/midsakatuparan-logo.png';
import BrandArtwork from './BrandArtwork';

const steps = ['details', 'verify', 'confirmed'];
export default function PublicLayout({ children, stage, compact = false }) {
  const current = steps.indexOf(stage);
  return <div className={`campaign-public-page${compact ? ' public-compact' : ''}`}>
    <BrandArtwork />
    <header className="campaign-public-header"><Link to="/" aria-label="MIDSAkatuparan home"><img src={logo} alt="MIDSAkatuparan" /></Link><Link to="/" className="campaign-home-link"><ArrowLeft size={15} /> The campaign</Link></header>
    {current >= 0 && <nav className="reservation-progress" aria-label="Reservation progress"><ol>{steps.map((step, index) => <li key={step} className={index <= current ? 'is-current' : ''} aria-current={index === current ? 'step' : undefined}><span>{index < current ? <Check size={13} /> : index + 1}</span>{['Your details', 'Verify email', 'Confirmed'][index]}</li>)}</ol></nav>}
    <div className="campaign-public-content">{children}</div>
    <footer className="campaign-public-footer"><Link to="/" aria-label="MIDSAkatuparan home"><img src={footerLogo} alt="MIDSAkatuparan" /></Link><span>MSU-IIT DOST-SEI Scholars' Association</span></footer>
  </div>;
}
