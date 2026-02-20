"use client";

import MainHeader from "@/components/MainHeader";
import BottomTabs from "@/components/BottomTabs";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen w-full relative">
            <MainHeader />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
            <BottomTabs />
        </div>
    );
}
