export default function Header() {
  return (
    <header className="site-header page-width">
      <a className="brand" href="./" aria-label="Atmos home"><span className="brand-mark" aria-hidden="true">a.</span> atmos<span className="brand-dot">/</span></a>
      <span className="header-note">A window to the weather.</span>
    </header>
  );
}
