import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import HeroSection from "@/components/home/HeroSection";
import AboutPreview from "@/components/home/AboutPreview";
import BrandsSection from "@/components/home/BrandsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import ServiceSection from "@/components/home/ServiceSection";
import PopularProducts from "@/components/home/PopularProducts";
import EventsSection from "@/components/home/EventsSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <Layout>
      <SEO
        title="Desmet Équipement — Spécialiste Moto à Wavre | Casques, Vestes, Intercoms"
        description="Desmet Équipement, votre spécialiste en équipement moto à Wavre. Arai Technical Pro Shop certifié. Casques, vestes, gants, bottes, intercoms Sena & Cardo. Chaussée de Louvain 491, 1300 Wavre."
        canonicalPath="/"
      />
      <HeroSection />
      <AboutPreview />
      <BrandsSection />
      <CategoriesSection />
      <ServiceSection />
      <PopularProducts />
      <EventsSection />
      <ReviewsSection />
      <ContactSection />
    </Layout>
  );
}
