import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CEFIS Mentor — Tutor de IA Personalizado",
  description:
    "Descubra seu plano de estudos personalizado com Inteligência Artificial. Trilhas profissionais em Contabilidade, Fiscal e Departamento Pessoal.",
  keywords: ["CEFIS", "contabilidade", "fiscal", "departamento pessoal", "CFC", "tutor IA"],
  openGraph: {
    title: "CEFIS Mentor — Tutor de IA Personalizado",
    description: "Seu plano de estudos personalizado por IA para carreiras em Contabilidade e Fiscal.",
    siteName: "CEFIS Mentor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
