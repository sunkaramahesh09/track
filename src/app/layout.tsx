import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ThemeProvider,
  THEME_BOOT_SCRIPT,
} from "@/components/theme/theme-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Placement OS",
    template: "%s · Placement OS",
  },
  description:
    "A daily operating system for placement preparation — tasks, scores, streaks and analytics that reward consistency over intensity.",
  applicationName: "Placement OS",
};

export const viewport: Viewport = {
  // Matches each theme's canvas, so the mobile browser chrome follows along.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#06070c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      /* The boot script stamps data-theme before React hydrates, so the
         server markup and the client legitimately differ on this element. */
      suppressHydrationWarning
    >
      <head>
        {/* Must run before first paint, or a stored light choice flashes the
            dark canvas on every navigation. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
