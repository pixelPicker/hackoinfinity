import type { Metadata } from "next";
import "./globals.css";
import { dmsans } from "./ui/fonts";

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
      <body className={`${dmsans.className}`}>{children}</body>
    </html>
  );
}
