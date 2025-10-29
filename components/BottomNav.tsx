'use client'
import Link from 'next/link'

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link href="/">🏠 Home</Link>
      <Link href="/income">💼 Income</Link>
      <Link href="/month">📊 Month</Link>
      <Link href="/saving-mode">💡 Saving</Link>
      <Link href="/settings">⚙️ Settings</Link>
    </nav>
  )
}
