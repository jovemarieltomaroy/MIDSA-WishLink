import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Asterisk, Gift, Image, Heart, Sparkles } from 'lucide-react';
import logo from '../assets/branding/campaign-logo-transparent.png';
import letterLogo from '../assets/branding/logobranded.png';
import campaignCard from '../assets/branding/campaign-card-2026.png';
import GalleryGiftTag from '../components/GalleryGiftTag';
import CampaignIntro from '../components/CampaignIntro';
import CampaignHeader from '../components/CampaignHeader';
import CampaignCountdown from '../components/CampaignCountdown';
import facebookImage from '../assets/social/facebook.png';
import xImage from '../assets/social/x.png';
import instagramImage from '../assets/social/instagram.png';


function CampaignEmailIcon({ size = 21, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3.5 19V5.5L12 12.8l8.5-7.3V19" stroke="#086747" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

const socialLinks = [
  { name: 'Facebook', image: facebookImage, href: 'https://www.facebook.com/MIDSAOnline', className: 'facebook' },
  { name: 'X', image: xImage, href: 'https://x.com/MIDSAOnline', className: 'x' },
  { name: 'Instagram', image: instagramImage, href: 'https://www.instagram.com/midsaonline/', className: 'instagram' },
  { name: 'Email', icon: CampaignEmailIcon, href: 'mailto:midsa@g.msuiit.edu.ph', className: 'email' },
];

const organizationPartners = [
  { name: 'KASAMA', file: 'KASAMA LOGO.png' },
  { name: 'CED-SC', file: '2026 CED-SC Logo.png' },
  { name: 'CSM-SC', file: "CSM-SC Logo '26-'27.png" },
  { name: 'CCS-SC', file: 'CCS LOGO.png' },
  { name: 'Partner organization 5', file: null },
  { name: 'Partner organization 6', file: null },
];

function PhotoPlaceholder({ label, caption, className = '' }) {
  return (
    <figure className={`brand-story-photo ${className}`}>
      <div><Image size={32} strokeWidth={1} aria-hidden="true" /><span>{label}</span></div>
      <figcaption className="brand-handwritten">{caption}</figcaption>
    </figure>
  );
}

export default function LandingPage() {
  const navLogoRef = useRef(null);
  return (
    <div className="brand-landing">
      <CampaignIntro targetRef={navLogoRef} />

      <CampaignHeader logoRef={navLogoRef} />

      <main>
        <section className="brand-hero">
          <div className="brand-hero-copy">
        
            <h1><em>MIDSAKatuparan:</em><br />Handog ng Saya</h1>
            <p>Learn about the campaign, find participation details, and follow updates from MIDSA.</p>
            <CampaignCountdown />
            <a href="#about" className="brand-button">Get to know the campaign <ArrowDown size={17} /></a>
          </div>

          <div className="brand-tag-scene">
            <span className="brand-doodle doodle-star" aria-hidden="true"><Asterisk size={62} strokeWidth={1.5} /></span>
            <GalleryGiftTag />
            <span className="brand-doodle doodle-heart" aria-hidden="true">â™¡</span>
          </div>
        </section>


        <section className="brand-about brand-section" id="about">
          <article className="brand-note">
            <span className="brand-tape" aria-hidden="true" />
            <div className="brand-letter-decoration"><img src={letterLogo} alt="MIDSA" /></div>
            <h3>What is <em> MIDSAKatuparan: Handog ng Saya?</em></h3>
            <p>MIDSAKatuparan: Handog ng Saya is a holiday giving initiative of the MSU-IIT DOST-SEI Scholarsâ€™ Association created to connect children and other beneficiaries from partner care centers with people who are willing to support their wishes and essential needs.</p>
            <p>The initiative works closely with partner care centers to gather and organize the beneficiariesâ€™ wish lists. These wishes are then prepared and displayed through holiday giving tree stations set up in partnership with different student organizations across the campus.</p>
            <p>Each displayed wish can be accessed by scanning its QR code, allowing potential donors to view the beneficiaryâ€™s request and choose one they would like to fulfill. After selecting a wish, the donor may purchase the requested gift and coordinate its drop-off for collection and eventual delivery to the intended beneficiary.</p>
            <p>At its core, MIDSAKatuparan brings together partner care centers, student organizations, and donors in a more personal and organized way of giving, helping make the holidays a little brighter for the beneficiaries it serves.</p>
            <footer className="brand-letter-signoff">
              <p><em>Lagi't lagi para sa bayan.</em></p>
              <p>DASIGMIDSA2026-7</p>
            </footer>
          </article>
        </section>

        <section className="brand-section brand-details" aria-labelledby="details-title"><div className="brand-section-heading"><span className="brand-kicker">CAMPAIGN GUIDE</span><h2 id="details-title">participation details</h2></div><div className="brand-detail-grid">
          <article className="brand-detail-card">
            <Gift size={26} strokeWidth={1.5} />
            <h3>How to take part</h3>
            <ol className="brand-participation-steps" role="list">
              {[
                { title: 'Find a tree', description: 'Visit a MIDSAKatuparan holiday giving tree station on campus.' },
                { title: 'Choose a wish', description: 'Pick a wish card and scan its QR code.' },
                { title: 'Read their story', description: 'View the request and choose a wish you can fulfill.' },
                { title: 'Reserve your wish', description: 'Follow the instructions on the wish page to reserve it.' },
                { title: 'Make it happen', description: 'Purchase the gift and coordinate its drop-off.' },
              ].map((step, index) => (
                <li key={step.title}>
                  <span className="brand-step-number" aria-hidden="true">{index + 1}</span>
                  <div className="brand-step-copy"><strong>{step.title}</strong><p>{step.description}</p></div>
                </li>
              ))}
            </ol>
          </article>
          <article className="brand-detail-card">
            <Heart size={26} strokeWidth={1.5} />
            <h3>The wishes we share</h3>
            <p>The wishes featured in MIDSAKatuparan come from children and other beneficiaries under the care of our partner communities. Their wish lists are gathered and coordinated privately to help protect their identities while still allowing donors to take part in fulfilling their holiday wishes.</p>
          </article>
          <article className="brand-detail-card">
            <Sparkles size={26} strokeWidth={1.5} />
            <h3>Dates to remember</h3>
            <ul className="brand-campaign-dates">
              {[
                { date: '2026-11-16', month: 'NOV', day: '23', weekday: 'Monday', title: 'Campaign opens', description: 'Start of the MIDSAKatuparan campaign' },
                { date: '2026-12-17', month: 'DEC', day: '17', weekday: 'Thursday', title: 'Gift drop-off deadline', description: 'Last day of the campaign and gift drop-off' },
                { date: '2026-12-19', month: 'DEC', day: '19', weekday: 'Saturday', title: 'Gift-Giving Program', description: 'Gift-Giving Program' },
              ].map((event) => (
                <li key={event.date}>
                  <time className="brand-calendar-date" dateTime={event.date} aria-label={`${event.month === 'NOV' ? 'November' : 'December'} ${event.day}, 2026`}>
                    <span className="brand-calendar-month">{event.month}</span>
                    <span className="brand-calendar-day">{event.day}</span>
                    <span className="brand-calendar-year">2026</span>
                  </time>
                  <div className="brand-calendar-event">
                    <span className="brand-calendar-weekday">{event.weekday}</span>
                    <strong>{event.title}</strong>
                    {event.description !== event.title && <span>{event.description}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div></section>

        <section className="brand-section brand-updates" id="updates" aria-labelledby="stations-title">
          <div className="brand-section-heading"><span className="brand-kicker">FIND A WISH</span><h2 id="stations-title">holiday giving tree stations</h2></div>
          <div className="brand-scrapbook-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <figure className="brand-photo-card" key={index}>
                <div><Image size={30} strokeWidth={1} /><span>Station photo coming soon</span></div>
                <figcaption className="brand-handwritten">Location {index + 1} â€” to be announced</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="brand-section brand-partners" aria-labelledby="partners-title">
          <div className="brand-section-heading">
            <span className="brand-kicker">TOGETHER IN GIVING</span>
            <h2 id="partners-title">our student organization partners</h2>
          </div>
          <ul className="brand-partner-logos">
            {organizationPartners.map((partner) => (
              <li key={partner.name}>
                <div className={`brand-partner-logo${partner.file ? '' : ' is-pending'}`}>{partner.file ? <img className={partner.name === 'KASAMA' ? 'brand-partner-logo-zoom' : undefined} src={`/Logos/${encodeURIComponent(partner.file)}`} alt={`${partner.name} logo`} loading="lazy" /> : <><Image size={24} strokeWidth={1} aria-hidden="true" /><span>Logo coming soon</span></>}</div>
                <span>{partner.name}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="brand-section brand-midsa-story" aria-labelledby="midsa-title">
          <div className="brand-story-row">
            <div className="brand-story-copy">
              <span className="brand-kicker">THE PEOPLE BEHIND THE CAMPAIGN</span>
              <h2 id="midsa-title">about us, <em>MIDSA</em></h2>
              <p>The <strong>MSU-IIT DOST-SEI Scholarsâ€™ Association (MIDSA)</strong> is an independent, non-profit student organization of DOST-SEI scholars at MSU-IIT. Guided by the <strong>#PatriotScholar</strong> spirit, MIDSA brings scholars together through academic support, community service, and initiatives that encourage unity, patriotism, and personal growth.</p>
              <p>The association supports its members through tutorials, activities that promote science and technology, and programs for student well-being. It also keeps scholars informed about announcements, stipend updates, and academic concerns.</p>
              <p>Through its activities and outreach programs, MIDSA encourages scholars to share their knowledge, serve their communities, and put science and technology in the service of the Filipino people.</p>
            </div>
            <div className="brand-midsa-collage">
              <figure className="brand-story-photo brand-story-photo-main">
                <div><img src="/images/meetMIDSA.jpg" alt="MIDSA members gathered for a group photo" loading="lazy" /></div>
                <figcaption className="brand-handwritten">MIDSA 2024-2025</figcaption>
              </figure>
              <figure className="brand-story-photo">
                <div><img src="/images/orgEvent.jpg" alt="MIDSA organization event" loading="lazy" /></div>
                <figcaption className="brand-handwritten">Hudyaka sa MIDSA</figcaption>
              </figure>
              <figure className="brand-story-photo">
                <div><img src="/images/midsainaction.png" alt="MIDSA members in action" loading="lazy" /></div>
                <figcaption className="brand-handwritten">MIDSA in action</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="brand-section brand-initiative-story" aria-labelledby="initiative-title">
          <div className="brand-story-row">
            <figure className="brand-story-photo brand-initiative-photo brand-campaign-card">
              <div>
                <img src={campaignCard} alt="MIDSAkatuparan 2026 Happy Holidays campaign card with a red ribbon and gift tags" loading="lazy" />
              </div>
            </figure>
            <div className="brand-story-copy">
              <span className="brand-kicker">MIDSAKatuparan: Handog ng Saya</span>
              <h2 id="initiative-title">a wish shared,<br /><em>a holiday made brighter</em></h2>
              <p>A gift can answer a simple wish, meet an everyday need, or remind someone that they are remembered. <strong>MIDSAKatuparan: Handog ng Saya</strong> brings that spirit of giving to children and other beneficiaries in partner care centers and communities.</p>
              <p>Each wish begins with a conversation. In coordination with partner centers, MIDSA gathers the things beneficiaries hope to receive and the essentials they need. Student organizations, external groups, and individual donors then help turn those requests into gifts chosen with someone specific in mind.</p>
              <p><strong>MIDSAKatuparan: Handog ng Saya</strong> connects these wishes with people willing to fulfill them. From choosing a wish to preparing a gift for drop-off, each step helps bring a little more care and joy to the holiday season.</p>
            </div>
          </div>
        </section>

        <section className="brand-section brand-outreach-story" aria-labelledby="outreach-title">
          <div className="brand-section-heading">
            <span className="brand-kicker">SERVICE BEYOND THE CAMPUS</span>
            <h2 id="outreach-title">moments with <em>the community</em></h2>
            <p>Behind every outreach visit are preparations, time spent together, and people who make the day possible. These photos look back on MIDSAâ€™s earlier community outreach, from getting ready for the visit to sharing moments with the community.</p>
          </div>
          <div className="brand-outreach-gallery">
            <figure className="brand-story-photo">
              <div><img src="/images/preparation.jpg" alt="Preparing for the outreach visit" loading="lazy" /></div>
              <figcaption className="brand-handwritten">Preparing for the visit</figcaption>
            </figure>
            <figure className="brand-story-photo">
              <div><img src="/images/outreach.jpg" alt="A shared moment during MIDSA's outreach" loading="lazy" /></div>
             
            </figure>
            <figure className="brand-story-photo">
              <div><img src="/images/with-community.jpg" alt="MIDSA together with the community" loading="lazy" /></div>
              <figcaption className="brand-handwritten">Together with the community</figcaption>
            </figure>
          </div>
        </section>
      </main>

      <footer className="brand-footer">
        <div className="brand-footer-identity"><Link to="/" aria-label="MIDSAkatuparan home"><img src={logo} alt="MIDSAkatuparan" /></Link><p><strong>MSU-IIT DOST-SEI Scholars' Association</strong><span>#DasigMIDSA Â· Lagi't lagi para sa bayan.</span></p></div>
        <div className="brand-socials" id="midsa-socials">
          <span className="brand-social-handle">midsaonline</span>
          <nav aria-label="MIDSA social media and email">
            {socialLinks.map((social) => <a key={social.name} className={`brand-social-icon brand-social-${social.className}`} href={social.href || undefined} aria-disabled={!social.href || undefined} aria-label={`${social.name === 'Email' ? 'Email MIDSA' : `MIDSA on ${social.name}`}${social.href ? '' : ' (link coming soon)'}`} title={`${social.name}${social.href ? '' : ' â€” link coming soon'}`}>{social.icon ? <social.icon size={21} strokeWidth={1.8} aria-hidden="true" /> : <img src={social.image} alt="" />}</a>)}
          </nav>
        </div>
        <Link to="/officer/login">Officer sign in <ArrowUpRight size={15} /></Link>
      </footer>
    </div>
  );
}
