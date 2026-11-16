import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import logo from '../assets/branding/campaign-logo-transparent.png';
import footerLogo from '../assets/branding/midsakatuparan-logo.png';
import BrandArtwork from './BrandArtwork';
import CampaignHeader from './CampaignHeader';
import CampaignCountdown from './CampaignCountdown';

const steps = ['details', 'verify', 'confirmed'];
export default function PublicLayout({ children, stage, compact = false, stickyHeader = false, showCountdown = false }) {
  const current = steps.indexOf(stage);
  const isMac = typeof navigator !== 'undefined'
    && /Mac/.test(navigator.userAgentData?.platform || navigator.platform)
    && navigator.maxTouchPoints <= 1;
  return <div className={`campaign-public-page${compact ? ' public-compact' : ''}${isMac ? ' is-mac' : ''}${stickyHeader ? ' has-sticky-header' : ''}`}>
    <BrandArtwork />
    {stickyHeader ? <CampaignHeader sticky /> : <header className="campaign-public-header"><Link to="/" aria-label="MIDSAkatuparan home"><img src={logo} alt="MIDSAkatuparan" /></Link><Link to="/" className="campaign-home-link"><ArrowLeft size={15} /> The campaign</Link></header>}
    {showCountdown && <CampaignCountdown />}
    {current >= 0 && <nav className="reservation-progress" aria-label="Reservation progress"><ol>{steps.map((step, index) => <li key={step} className={index <= current ? 'is-current' : ''} aria-current={index === current ? 'step' : undefined}><span>{index < current ? <Check size={13} /> : index + 1}</span>{['Your details', 'Verify email', 'Confirmed'][index]}</li>)}</ol></nav>}
    <div className="campaign-public-content">{children}</div>
    <footer className="campaign-public-footer"><Link to="/" aria-label="MIDSAkatuparan home"><img src={footerLogo} alt="MIDSAkatuparan" /></Link><span>MSU-IIT DOST-SEI Scholars' Association</span></footer>
  </div>;
}
