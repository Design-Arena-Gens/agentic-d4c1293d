"use client";

import "./globals.css";
import { useEffect } from "react";

const fontFamily = "Poppins, sans-serif";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if (document.fonts) {
      const poppins = new FontFace(
        "Poppins",
        "url(https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfedg.woff2)"
      );
      poppins.load().then(() => {
        document.fonts.add(poppins);
      });
    }
  }, []);

  return (
    <html lang="vi" style={{ fontFamily }}>
      <head>
        <title>Video Chú Khỉ Trong Vườn Chuối</title>
        <meta
          name="description"
          content="Tạo video chú khỉ dễ thương trong vườn chuối bằng hoạt họa trực tuyến."
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
