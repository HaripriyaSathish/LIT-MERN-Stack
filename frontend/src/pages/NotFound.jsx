import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="info-page pattern-section">
      <div className="container">
        <article className="info-page__card">
          <h1 className="section-title">Page not found</h1>
          <p>The page you are looking for does not exist.</p>
          <p><Link className="btn btn--gold" to="/">Back to home</Link></p>
        </article>
      </div>
    </main>
  );
}
