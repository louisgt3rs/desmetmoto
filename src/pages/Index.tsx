import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import AboutPreview from "@/components/home/AboutPreview";
import BrandsSection from "@/components/home/BrandsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import PopularProducts from "@/components/home/PopularProducts";
import EventsSection from "@/components/home/EventsSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <AboutPreview />
      <BrandsSection />
      <CategoriesSection />
      <PopularProducts />
      <EventsSection />
      <ReviewsSection />
      <ContactSection />
    </Layout>
  );
}
