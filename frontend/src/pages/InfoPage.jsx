import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { PageHeader } from "../components/Navbar";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";
import { Lines } from "../components/common";
import useSiteMeta from "../hooks/useSiteMeta";
import NotFound from "./NotFound";

/** Privacy Policy, Community Guidelines... (linked from the footer) */
export default function InfoPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    api.get(`/pages/${slug}`)
      .then((res) => { setData(res.data); setStatus("ok"); window.scrollTo(0, 0); })
      .catch((err) => setStatus(err.response?.status === 404 ? "missing" : errorMessage(err)));
  }, [slug]);

  useSiteMeta(data?.site, data?.page.title);

  if (status === "missing") return <NotFound />;
  if (status === "loading") return <div className="page-loading" aria-busy="true" />;
  if (status !== "ok") return <p className="page-message">Sorry, this page could not be loaded. ({status})</p>;

  const { page, navbar, footer, site } = data;
  return (
    <>
      <PageHeader navbar={navbar} />

      <main className="info-page pattern-section">
        <div className="container">
          <article className="info-page__card">
            <h1 className="section-title">{page.title}</h1>
            <p className="info-page__updated">Last updated {page.updated_display}</p>
            {page.blocks.map((block, i) =>
              block.type === "heading"
                ? <h2 key={i} className="info-page__heading">{block.text}</h2>
                : <p key={i}><Lines text={block.text} /></p>
            )}
          </article>
        </div>
      </main>

      <Footer footer={footer} site={site} />
      <CookieBanner site={site} />
    </>
  );
}
