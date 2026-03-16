import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden max-w-full">
      <Navbar />
      <main className="flex-1 pt-16 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}
