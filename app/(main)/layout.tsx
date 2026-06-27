import Navbar from '../../src/components/Navbar'
import Footer from '../../src/components/Footer'
import ZaloChatWidget from "@/src/components/ZaloChatWidget";

export default function MainLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            <Navbar/>
            <main className="flex-1">{children}</main>
            <ZaloChatWidget/>
            <Footer/>
        </>
    )
}