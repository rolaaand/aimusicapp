'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Main' },
    { href: '/search', label: '검색' },
  ]

  return (
    <div className="flex items-center gap-1">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === href
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
