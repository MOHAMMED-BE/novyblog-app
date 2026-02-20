import Header from "@/shared/components/header/Header";
import Footer from "@/shared/components/footer/Footer";
import ThemeRegistry from "@/providers/ThemeRegistry";
import { Providers } from "@/providers/providers";
import "./globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen">
                <ThemeRegistry>
                    <Providers>
                        <Header />

                        <main className="min-h-[calc(100vh-64px)] pb-16">
                            {children}
                        </main>

                        <Footer />
                    </Providers>
                </ThemeRegistry>
            </body>
        </html>
    );
}