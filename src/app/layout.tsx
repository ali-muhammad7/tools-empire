import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tools Empire — Free Online Tools",
    template: "%s | Tools Empire",
  },
  description:
    "A premium collection of free online tools — word counter, JSON formatter, password generator, QR code generator and more. Fast, private, and running entirely in your browser.",
  keywords: [
    "free online tools",
    "word counter",
    "json formatter",
    "password generator",
    "qr code generator",
    "base64 encoder",
    "color converter",
  ],
  authors: [{ name: "Tools Empire" }],
  openGraph: {
    type: "website",
    siteName: "Tools Empire",
    title: "Tools Empire — Free Online Tools",
    description:
      "A premium collection of free online tools. Fast, private, and running entirely in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools Empire — Free Online Tools",
    description:
      "A premium collection of free online tools. Fast, private, and running entirely in your browser.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
