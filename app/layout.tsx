import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import NavLinks from '@/app/components/NavLinks'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Music Hub',
  description: 'AI로 만든 음악 재생목록을 공유하고 평가해보세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <img src="/logo.png" alt="AI Music Hub" className="h-10 w-auto" />
              </Link>
              <NavLinks />
            </div>
            <Link
              href="/publish"
              className="bg-purple-600 hover:bg-purple-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
            >
              + 재생목록 퍼블리시
            </Link>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
