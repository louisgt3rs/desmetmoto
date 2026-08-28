import { useEffect } from "react";

const SITE_URL = "https://www.desmetequipement.com";
const DEFAULT_OG_IMAGE = "https://www.desmetequipement.com/og-image.jpg";
const DEFAULT_DESCRIPTION =
  "Desmet Équipement, votre spécialiste en équipement moto à Wavre. Casques Arai, vestes, gants, bottes et intercoms. Arai Technical Pro Shop certifié.";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  jsonLd?: object;
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SEO({ title, description = DEFAULT_DESCRIPTION, image = DEFAULT_OG_IMAGE, canonicalPath, jsonLd }: SEOProps) {
  useEffect(() => {
    const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL + window.location.pathname;

    document.title = title;

    setMeta("name", "description", description);
    setLink("canonical", canonical);

    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Desmet Équipement");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:locale", "fr_BE");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    // Inject or update JSON-LD script
    const LD_ID = "seo-json-ld";
    let ldEl = document.getElementById(LD_ID) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!ldEl) {
        ldEl = document.createElement("script");
        ldEl.id = LD_ID;
        ldEl.type = "application/ld+json";
        document.head.appendChild(ldEl);
      }
      ldEl.textContent = JSON.stringify(jsonLd);
    } else if (ldEl) {
      ldEl.remove();
    }
  }, [title, description, image, canonicalPath, jsonLd]);

  return null;
}
