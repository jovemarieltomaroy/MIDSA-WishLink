import background from '../assets/branding/campaign-background.jpg';

export default function BrandArtwork() {
  return <div className="brand-artwork" aria-hidden="true">
    <img className="brand-art-scene" src={background} alt="" />
  </div>;
}
