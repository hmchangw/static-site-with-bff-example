import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Static Next.js + BFF demo",
  description: "Statically exported Next.js app calling a separate BFF.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
