import type { Metadata } from "next";
import { Archivo_Black, Inter, Space_Mono, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { Loader } from "@/components/Loader";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clutch Kicks | Stepping Correct",
  description:
    "Deadstock sneakers, receipt in box. Nike, Adidas, Jordan, Converse, New Balance and more — Lagos same-day delivery.",
  keywords: ["streetwear", "sneakers", "clutch kicks", "lagos sneakers", "deadstock"],
  openGraph: {
    title: "Clutch Kicks | Stepping Correct",
    description: "Deadstock sneakers, receipt in box. Stepping Correct.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${inter.variable} ${spaceMono.variable} ${permanentMarker.variable} antialiased`}
    >
      <body className="bg-bg text-ink min-h-screen selection:bg-volt selection:text-ink overflow-x-clip">
        <Loader />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
