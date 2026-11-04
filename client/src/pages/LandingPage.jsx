import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Asterisk, Gift, Image, Heart, Sparkles } from 'lucide-react';
import logo from '../assets/branding/campaign-logo-transparent.png';
import letterLogo from '../assets/branding/logobranded.png';
import GalleryGiftTag from '../components/GalleryGiftTag';


export default function LandingPage() {
  return (
    <div className="brand-landing">

      <header className="brand-nav">
        <Link to="/" aria-label="MIDSAkatuparan home"><img src={logo} alt="MIDSAkatuparan" /></Link>
        <nav aria-label="Main navigation"><a href="#about">The campaign</a><a href="#updates">Tree stations</a><Link className="brand-gallery-link" to="/gallery">Gallery</Link><Link className="brand-portal-link" to="/officer/login">Officer portal <ArrowUpRight size={16} /></Link></nav>
      </header>

      <main>
        <section className="brand-hero">
          <div className="brand-hero-copy">
        
            <h1><em>MIDSAkatuparan:</em><br />Handog ng Pasko</h1>
            <p>Learn about the campaign, find participation details, and follow updates from MIDSA.</p>
            <a href="#about" className="brand-button">Get to know the campaign <ArrowDown size={17} /></a>
          </div>

          <div className="brand-tag-scene">
            <span className="brand-doodle doodle-star" aria-hidden="true"><Asterisk size={62} strokeWidth={1.5} /></span>
            <GalleryGiftTag />
            <span className="brand-doodle doodle-heart" aria-hidden="true">♡</span>
          </div>
        </section>


        <section className="brand-about brand-section" id="about">
          <article className="brand-note">
            <span className="brand-tape" aria-hidden="true" />
            <div className="brand-letter-decoration"><img src={letterLogo} alt="MIDSA" /></div>
            <h3>What is <em> MIDSAKatuparan: Handog ng Pasko?</em></h3>
            <p>MIDSAKatuparan: Handog ng Pasko is a Christmas giving initiative of the MSU-IIT DOST-SEI Scholars’ Association created to connect children and other beneficiaries from partner care centers with people who are willing to support their wishes and essential needs.</p>
            <p>The initiative works closely with partner care centers to gather and organize the beneficiaries’ wish lists. These wishes are then prepared and displayed through Christmas tree stations set up in partnership with different student organizations across the campus.</p>
            <p>Each displayed wish can be accessed by scanning its QR code, allowing potential donors to view the beneficiary’s request and choose one they would like to fulfill. After selecting a wish, the donor may purchase the requested gift and coordinate its drop-off for collection and eventual delivery to the intended beneficiary.</p>
            <p>At its core, MIDSAKatuparan brings together partner care centers, student organizations, and donors in a more personal and organized way of giving, helping make Christmas a little brighter for the beneficiaries it serves.</p>
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
                { title: 'Find a tree', description: 'Visit a MIDSAKatuparan Christmas tree station on campus.' },
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
            <p>The wishes featured in MIDSAKatuparan come from children and other beneficiaries under the care of our partner communities. Their wish lists are gathered and coordinated privately to help protect their identities while still allowing donors to take part in fulfilling their Christmas wishes.</p>
          </article>
          <article className="brand-detail-card">
            <Sparkles size={26} strokeWidth={1.5} />
            <h3>Dates to remember</h3>
            <ul className="brand-campaign-dates">
              <li><strong><time dateTime="2026-11-16">November 16, 2026</time></strong><span>Start of the MIDSAKatuparan campaign</span></li>
              <li><strong><time dateTime="2026-12-17">December 17, 2026</time></strong><span>Last day of the campaign and gift drop-off</span></li>
              <li><strong><time dateTime="2026-12-19">December 19, 2026</time></strong><span>Gift-Giving Program</span></li>
            </ul>
          </article>
        </div></section>

        <section className="brand-section brand-updates" id="updates" aria-labelledby="stations-title">
          <div className="brand-section-heading"><span className="brand-kicker">FIND A WISH</span><h2 id="stations-title">christmas tree stations</h2></div>
          <div className="brand-scrapbook-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <figure className="brand-photo-card" key={index}>
                <div><Image size={30} strokeWidth={1} /><span>Station photo coming soon</span></div>
                <figcaption className="brand-handwritten">Location {index + 1} — to be announced</figcaption>
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
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index}>
                <div className="brand-partner-placeholder"><Image size={24} strokeWidth={1} aria-hidden="true" /><span>Logo coming soon</span></div>
                <span>Partner organization {index + 1}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="brand-footer"><Link to="/" aria-label="MIDSAkatuparan home"><img src={logo} alt="MIDSAkatuparan" /></Link><p><strong>MSU-IIT DOST-SEI Scholars' Association</strong><span>#DasigMIDSA · Lagi't lagi para sa bayan.</span></p><Link to="/officer/login">Officer sign in <ArrowUpRight size={15} /></Link></footer>
    </div>
  );
}
