import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/manrope";
import "./globals.css";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ServiceWorker } from "@/components/ServiceWorker";
import { StoreHydrator } from "@/components/StoreHydrator";

export const metadata: Metadata = {
  title: "Your CFO",
  description: "A wealth manager for everyone. Prototype.",
  applicationName: "Your CFO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Your CFO",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f1ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {/* First in the tree so its effect runs before any screen's: a `set()`
            before rehydration would persist the empty initial state over the
            saved one (zustand persist with skipHydration). */}
        <StoreHydrator />
        <PhoneFrame>{children}</PhoneFrame>
        <ServiceWorker />
      </body>
    </html>
  );
}
