import type { Metadata } from "next";
import "./globals.css";
import { dmsans } from "./ui/fonts";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "DoodleSquad",
  description: "A collabrative whiteboard app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmsans.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
