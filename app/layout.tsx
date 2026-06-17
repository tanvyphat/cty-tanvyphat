import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import NextTopLoader from 'nextjs-toploader'
import Navbar from '../src/components/Navbar'
import Footer from '../src/components/Footer'
import ContactCTA from '../src/components/ContactCTA'
import { CartProvider } from '../src/contexts/CartContext'
import { AuthProvider } from '../src/contexts/AuthContext'

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
  verification: {
    google: 'google8327f2021776fbf0',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'CT Tân Vy Phát',
  alternateName: 'Công ty TNHH MTV SX TM Tân Vy Phát',
  url: 'https://tanvyphat.com',
  logo: 'https://tanvyphat.com/logo.png',
  image: 'https://tanvyphat.com/logo.png',
  description:
    'Chuyên phân phối giấy in A4, văn phòng phẩm, bìa Thái, nhựa ép giá sỉ tại Q.12 TPHCM. Hàng chính hãng, ship toàn quốc.',
  telephone: '+84903608768',
  email: 'tanvyphatpaper@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1/6 Đường Tân Thới Nhất 22, Khu phố 8, Phường Đông Hưng Thuận',
    addressLocality: 'TP. Hồ Chí Minh',
    addressRegion: 'TP. Hồ Chí Minh',
    addressCountry: 'VN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 10.823378689328257,
    longitude: 106.61907487497048,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '07:30',
      closes: '17:30',
    },
  ],
  sameAs: ['https://www.facebook.com/100023082080173'],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CT Tân Vy Phát',
  url: 'https://tanvyphat.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://tanvyphat.com/san-pham?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-[#f8fafc] text-[#1e293b]" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <NextTopLoader color="#1a56db" showSpinner={false} />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ContactCTA />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
