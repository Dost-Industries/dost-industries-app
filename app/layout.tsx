import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "../contexts/AuthContext";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "DOST Industries",
  description: "Digital Welding & Engineering Tools",
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}