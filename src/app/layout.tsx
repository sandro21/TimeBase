import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import { FilterProvider } from "@/contexts/FilterContext";
import { EventsProvider } from "@/contexts/EventsContext";
import { ProProvider } from "@/contexts/ProContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Empty SVG so the tab does not use a default favicon graphic. */
const emptyTabIcon =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="none"/></svg>'
  );

export const metadata: Metadata = {
  title: "TimeBase",
  icons: {
    icon: emptyTabIcon,
    apple: emptyTabIcon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="theme-color" content="#e3e8e6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${urbanist.className} antialiased`} style={{ colorScheme: 'light', backgroundColor: 'var(--page-bg)' }} suppressHydrationWarning>
        <ProProvider>
        <ChatProvider>
        <FilterProvider>
          <EventsProvider>
            <div className="flex min-h-dvh flex-col bg-[color:var(--page-bg)]">
              <AppHeader />
              <Suspense fallback={null}>
                <GlobalFilterBar />
              </Suspense>
              <div
                className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
                style={{ position: "relative", zIndex: 1 }}
              >
                {children}
              </div>
            </div>
            <ChatSidebar />
          </EventsProvider>
        </FilterProvider>
        </ChatProvider>
        </ProProvider>
        <Analytics />
      </body>
    </html>
  );
}
