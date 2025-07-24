import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { AppWrapper } from "@/context/index";
import Footer from '@/components/Footer';

export const metadata = {
  title: "UTILS-NITTISH",
  description: "a utils web by - Nittish",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="bg-black text-white  font-inter">
        <SessionWrapper>
          <AppWrapper>
            <Navbar />
            <Toaster
             position="top-right"
            />
            <div className="mt-20">
            <main>{children}</main>
            </div>
            <Footer />
          </AppWrapper>
        </SessionWrapper>
      </body>
    </html>
  );
}