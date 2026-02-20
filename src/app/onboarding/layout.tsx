export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-[#050506]">
            {children}
        </div>
    );
}
