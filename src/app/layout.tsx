import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { AccessGate } from "@/components/AccessGate";

export const metadata: Metadata = {
  title: "Kiln Tracker",
  description:
    "Dashboard for kiln firings, glaze projects, and studio maintenance tracking.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AccessGate>{children}</AccessGate>
      </body>
    </html>
  );
}
