export default function EmptyState() {
  return (
    <section className="empty-state" aria-labelledby="empty-heading">
      <span className="empty-icon" aria-hidden="true">☀</span>
      <div>
        <p className="eyebrow">A WORLD OF WEATHER</p>
        <h2 id="empty-heading">Your next view starts here.</h2>
        <p>Pick a city above. We’ll bring you current conditions<br className="desktop-break" /> and a little look ahead.</p>
      </div>
      <span className="empty-coordinate" aria-hidden="true">N / E / S / W</span>
    </section>
  );
}
