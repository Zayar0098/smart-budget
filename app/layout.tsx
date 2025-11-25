import "./globals.css";
import CurrencyProvider from "@/components/CurrencyProvider";
import BottomNav from "@/components/BottomNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <CurrencyProvider>
          {children}</CurrencyProvider>
        <BottomNav />
      </body>
    </html>
  );
}