import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { AppWrapper } from "@/context/index";
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Student Skill Development Portal',
  description: 'A comprehensive platform for skill development and learning',
}

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
            <div className="max-w-5xl mx-auto px-4 pt-28 pb-10 min-h-screen">
            <main>{children}</main>
            </div>
            {/* <Footer /> */}
          </AppWrapper>
        </SessionWrapper>
      </body>
    </html>
  );
}