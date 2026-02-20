import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "PitchReport - AI 영업 상담 분석",
    description: "영업 상담 녹음을 분석하여 성장 리포트를 제공합니다.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" className="dark">
            <body className={`${inter.className} bg-[#050505] flex justify-center`}>
                <main className="mobile-container">
                    {children}
                </main>
            </body>
        </html>
    );
}
