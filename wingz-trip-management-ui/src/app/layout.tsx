import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";

export const metadata: Metadata = {
  title: "Wingz Trip Management",
  description: "Ride management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('wingz_theme');var c=t==='light'?'light':'dark';document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(c);})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-surface-50 dark:bg-[#0d0d0f] text-surface-900 dark:text-gray-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
