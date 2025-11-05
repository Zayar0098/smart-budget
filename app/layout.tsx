import "./globals.css";
import "@/styles/variables.css";
import "@/styles/components.css";
import { AppProvider } from "@/context/AppProvider";
import Header from "@/components/Header";

export const metadata = {
  title: "Money Tracker",
  description: "Track income and expenses with local storage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Header />
          <main className="container">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
