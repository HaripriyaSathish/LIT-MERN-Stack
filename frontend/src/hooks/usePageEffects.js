import { useEffect } from "react";

/**
 * Same scroll effects as the original site (static/core/js/main.js):
 *  - header shadow once the page scrolls
 *  - highlight the menu link of the section in view
 *  - floating buttons hide when the footer comes into view
 *  - fade-up of every [data-reveal] element, with a small stagger
 * Runs after the page content has rendered (ready = true).
 */
export default function usePageEffects(ready) {
  useEffect(() => {
    if (!ready) return undefined;
    const cleanups = [];

    // Header shadow
    const header = document.getElementById("siteHeader");
    const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // Open the section from the URL hash (e.g. /#events) once the content exists
    if (window.location.hash.length > 1) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }

    if ("IntersectionObserver" in window) {
      // Active menu link
      const navLinks = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
      const linkFor = {};
      navLinks.forEach((link) => { linkFor[link.getAttribute("href").slice(1)] = link; });
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const link = linkFor[entry.target.id];
          if (!link || !entry.isIntersecting) return;
          navLinks.forEach((other) => other.classList.remove("is-active"));
          link.classList.add("is-active");
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(linkFor).forEach((id) => {
        const section = document.getElementById(id);
        if (section) sectionObserver.observe(section);
      });
      cleanups.push(() => sectionObserver.disconnect());

      // Floating buttons stay visible until the footer comes into view
      const floating = document.getElementById("floatingButtons");
      const footer = document.getElementById("siteFooter");
      if (floating && footer) {
        const footerObserver = new IntersectionObserver((entries) => {
          floating.classList.toggle("is-hidden", entries[0].isIntersecting);
        }, { threshold: 0.05 });
        footerObserver.observe(footer);
        cleanups.push(() => footerObserver.disconnect());
      }

      // Fade-up on scroll
      const revealItems = document.querySelectorAll("[data-reveal]");
      if (revealItems.length) {
        document.documentElement.classList.add("js-reveal");
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
        revealItems.forEach((item, index) => {
          item.style.transitionDelay = `${(index % 4) * 0.08}s`; // small stagger for items that appear together
          revealObserver.observe(item);
        });
        cleanups.push(() => revealObserver.disconnect());
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, [ready]);
}
