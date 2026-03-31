import { useEffect } from "react";

const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/20258dc4-fa1a-4d45-a924-0eee670d0095/id-preview-47eafc64--3cfa2803-be3b-4e38-a987-3a6e334982ab.lovable.app-1773707042149.png";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
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

export default function SEO({ title, description, image = DEFAULT_OG_IMAGE }: SEOProps) {
  useEffect(() => {
    document.title = title;
    setMeta("property", "og:title", title);
    setMeta("name", "twitter:title", title);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:image", image);
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
  }, [title, description, image]);

  return null;
}
