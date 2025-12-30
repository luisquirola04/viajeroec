import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viajero Ec",
  description: "Sistema para turismo en Ecuador",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
          {/* Contenedor Flex Principal */}
          <div className="flex min-h-screen">
          
            
            {/* 2. El Contenido Principal (Derecha) */}
            <main className="flex-1 overflow-auto bg-background">
              {children}
            </main>
            
          </div>
      </body>
    </html>
  );
}