import { useEffect } from "react";

function setMeta(selector, attr, value) {
  if (!value) return;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement(selector.startsWith("link") ? "link" : "meta");
    const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/);
    tag.setAttribute(key, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attr, value);
}

/** Browser title, description, favicon and sharing tags from Site Settings */
export default function useSiteMeta(site, pageTitle) {
  useEffect(() => {
    if (!site) return;
    const title = pageTitle ? `${pageTitle} | ${site.site_title}` : site.site_title;
    document.title = title;
    setMeta('meta[name="description"]', "content", site.meta_description);
    setMeta('meta[property="og:title"]', "content", site.site_title);
    setMeta('meta[property="og:description"]', "content", site.meta_description);
    setMeta('meta[property="og:image"]', "content", site.og_image);
    setMeta('link[rel="icon"]', "href", site.favicon);
    setMeta('link[rel="apple-touch-icon"]', "href", site.favicon);
  }, [site, pageTitle]);
}
