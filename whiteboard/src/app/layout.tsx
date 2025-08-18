import type { Metadata } from "next";
import "./globals.css";
import { dmsans } from "./ui/fonts";
<<<<<<< HEAD
=======
import Providers from "@/components/Providers";
>>>>>>> upstream/master

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
<<<<<<< HEAD
      <body className={`${dmsans.className}`}>{children}</body>
=======
      <body className={`${dmsans.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
>>>>>>> upstream/master
    </html>
  );
}
