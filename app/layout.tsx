import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import NextTopLoader from 'nextjs-toploader'
import Navbar from '../src/components/Navbar'
import Footer from '../src/components/Footer'
import ContactCTA from '../src/components/ContactCTA'
import { CartProvider } from '../src/contexts/CartContext'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanvyphat.com'),
  title: {
    default: 'CT Tân Vy Phát | Giấy In & VPP Giá Sỉ TPHCM',
    template: '%s | CT Tân Vy Phát',
  },
  description:
    'CT Tân Vy Phát – Chuyên phân phối giấy in A4, văn phòng phẩm, bìa Thái, nhựa ép giá sỉ tại Q.12 TPHCM. Hàng chính hãng, ship toàn quốc. Liên hệ: 090 360 87 68.',
  keywords: [
    'giấy in giá sỉ',
    'văn phòng phẩm TPHCM',
    'giấy A4',
    'bìa Thái',
    'nhựa ép',
    'Tân Vy Phát',
    'Q.12',
    'giấy Double A',
    'giấy Projecta',
  ],
  openGraph: {
    title: 'CT Tân Vy Phát | Giấy In & VPP Giá Sỉ TPHCM',
    description:
      'Chuyên phân phối giấy in A4, văn phòng phẩm, bìa Thái, nhựa ép giá sỉ. Ship toàn quốc.',
    locale: 'vi_VN',
    type: 'website',
    siteName: 'CT Tân Vy Phát',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#f8fafc] text-[#1e293b]">
        <NextTopLoader color="#1a56db" showSpinner={false} />
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ContactCTA />
        </CartProvider>
      </body>
    </html>
  )
}
