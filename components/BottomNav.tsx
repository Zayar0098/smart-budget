"use client";
import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link href="/">Home</Link>
      <Link href="/income">Part-time income</Link>
      <Link href="/saving">Saving mode</Link>
      <Link href="/month">Calendar</Link>
      <Link href="/settings">Profile</Link>
    </nav>
  );
}
