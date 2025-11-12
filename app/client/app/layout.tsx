import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { UserProvider } from "@/store/userContext";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CitrusOps | CI/CD Pipeline Observability",
  description: "CI/CD Pipeline Observability Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextTopLoader color="#FB6107" showSpinner={false} />
          <UserProvider>{children}</UserProvider>
          <Toaster
            toastOptions={{
              style: {
                backgroundColor: "#18181b",
                color: "white",
                borderRadius: "50px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
