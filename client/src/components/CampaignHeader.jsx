import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import logo from '../assets/branding/campaign-logo-transparent.png';

export default function CampaignHeader({ logoRef, sticky = false }) {
  const { pathname } = useLocation();
  const landing = pathname === '/';
  return (
    <header className={`brand-nav${sticky ? ' brand-nav-sticky' : ''}`}>
      <Link to="/" aria-label="MIDSAkatuparan home"><img ref={logoRef} src={logo} alt="MIDSAkatuparan" /></Link>
      <nav aria-label="Main navigation">
        <Link to="/" onClick={() => { if (landing) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>The campaign</Link>
        <a href={landing ? '#updates' : '/#updates'}>Tree stations</a>
        <Link className="brand-gallery-link" to="/gallery">Gallery</Link>
        <Link className="brand-portal-link" to="/officer/login">Officer portal <ArrowUpRight size={16} /></Link>
      </nav>
    </header>
  );
}
