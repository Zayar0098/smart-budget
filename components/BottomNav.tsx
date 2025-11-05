import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link href="/">Home</Link>
      <Link href="/income">part-time income</Link>
      <Link href="/month">Calendar</Link>
      <Link href="/settings">Profile</Link>
    </nav>
  );
}
