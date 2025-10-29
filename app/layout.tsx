import './globals.css'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'

export const metadata = {
  title: 'Money Tracker',
  description: 'Track income and expenses with local storage'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main className="main-content">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
