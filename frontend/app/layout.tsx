import type { Metadata } from "next";
import { Lato } from 'next/font/google'
 
const lato = Lato({
    weight: '400',
    subsets: ['latin'],
})

import "./globals.css";

export const metadata: Metadata = {
  title: "HSGS Hackathon",
  description: "HSGS Hackathon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lato.className}>{children}</body>
    </html>
  );
}