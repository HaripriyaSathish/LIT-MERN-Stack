import { useEffect, useState } from "react";
import api, { errorMessage } from "../api/client";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Community from "../components/Community";
import Events from "../components/Events";
import Gallery from "../components/Gallery";
import Messages from "../components/Messages";
import Join from "../components/Join";
import Social from "../components/Social";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import FloatingButtons from "../components/FloatingButtons";
import CookieBanner from "../components/CookieBanner";
import usePageEffects from "../hooks/usePageEffects";
import useSiteMeta from "../hooks/useSiteMeta";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/site").then((res) => setData(res.data)).catch((err) => setError(errorMessage(err)));
  }, []);

  useSiteMeta(data?.site);
  usePageEffects(Boolean(data));

  if (error) return <p className="page-message">Sorry, the website could not be loaded. ({error})</p>;
  if (!data) return <div className="page-loading" aria-busy="true" />;

  return (
    <>
      <Navbar navbar={data.navbar} />

      <main>
        <Hero hero={data.hero} />
        <About about={data.about} />
        <Community community={data.community} />
        <Events section={data.events_section} events={data.events} />
        <Gallery gallery={data.gallery} />
        <Messages section={data.messages_section} />
        <Join join={data.join} />
        <Social social={data.social} />
        <Contact contact={data.contact} />
      </main>

      <Footer footer={data.footer} site={data.site} />
      <FloatingButtons buttons={data.floating} />
      <CookieBanner site={data.site} />
    </>
  );
}
