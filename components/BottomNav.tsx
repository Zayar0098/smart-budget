'use client'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCalendarDays, faPiggyBank, faGear } from '@fortawesome/free-solid-svg-icons';


export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link href="/"><FontAwesomeIcon icon={faHouse} />Home</Link>
      <Link href="/income">💼 Income</Link>
      <Link href="/month"><FontAwesomeIcon icon={faCalendarDays} />Calender</Link>
      <Link href="/saving-mode"><FontAwesomeIcon icon={faPiggyBank} />Saving</Link>
      <Link href="/settings"><FontAwesomeIcon icon={faGear} />Settings</Link>
    </nav>
  )
}
