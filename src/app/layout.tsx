import type { Metadata } from "next";
import { Anton, Raleway, Red_Hat_Display } from "next/font/google";
import "./globals.css";

const anton = Anton({ variable: "--font-impact", weight: "400", subsets: ["latin"] });
const raleway = Raleway({ variable: "--font-body", subsets: ["latin"] });
const redHat = Red_Hat_Display({ variable: "--font-heading", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://photo.ae2v.fr"),
  title: "Photos AE2V",
  description: "Les albums photo des événements de l’AE2V.",
  icons: { icon: "/emblem-ae2v-white.svg" },
  openGraph: {
    title: "Photos AE2V",
    description: "Retrouve les albums des événements de l’association.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${anton.variable} ${raleway.variable} ${redHat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
