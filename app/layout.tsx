import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "../contexts/AuthContext";

export const metadata: Metadata = {
  title: "DOST Industries",
  description: "Advanced welding software for professional welders.",
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
      </body>
    </html>
  );
}