import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Consultant",
  description: "AI-powered Health Consultation Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-screen">
      <body className={`${inter.className} min-h-screen text-slate-900 antialiased flex flex-col bg-white/95 relative`}>
        <div className="fixed inset-0 z-[-1] bg-white/95" />
        <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Health Consult AI
                  </span>
                </Link>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  <Link
                    href="/patients"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Patients
                  </Link>
                  <Link
                    href="/consultations"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Consultations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
