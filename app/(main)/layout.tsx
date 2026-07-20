import Navbar from '../../src/components/Navbar'
import Footer from '../../src/components/Footer'
import ZaloChatWidget from "@/src/components/ZaloChatWidget";
import { getCategories } from '../../src/lib/supabase/server'
import ScrollToTop from "@/src/components/ScrollToTop";

export default async function MainLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    const categories = await getCategories()
    return (
        <>
            <Navbar categories={categories}/>
            <main className="flex-1">{children}</main>
            <ZaloChatWidget/>
            <ScrollToTop />
            <Footer/>
        </>
    )
}