"use client"
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// FontAwesomeIconのインポートリストはユーザー提供のものを使用
import { faHouse, faCalendarDays, faPiggyBank, faGear, faClock } from '@fortawesome/free-solid-svg-icons'; 
import styles from './BottomNav.module.css'; // Import the new CSS Module

export default function BottomNav() {
  // navContainerがposition: fixedを適用し、ナビゲーションを画面下部に固定します。
  return (
    <div className={styles.navContainer}>
      <nav className={styles.bottomNav}>
        
        {/* 1. Home */}
        <Link href="/" className={styles.navLink}>
          <FontAwesomeIcon icon={faHouse} />
          Home
        </Link>

        <Link href="/pincome" className={styles.navLink}>
          <FontAwesomeIcon icon={faClock} />
          P-Time
        </Link>
        
        {/* 2. Calendar */}
        <Link href="/month" className={styles.navLink}>
          <FontAwesomeIcon icon={faCalendarDays} />
          Calendar
        </Link>
        
        {/* 3. Saving Mode */}
        <Link href="/saving-mode" className={styles.navLink}>
          <FontAwesomeIcon icon={faPiggyBank} />
          Saving
        </Link>
        
        {/* 4. Income (Profile/Settingsとして利用) */}
        <Link href="/settings" className={styles.navLink}>
          <FontAwesomeIcon icon={faGear} /> 
          Settings
        </Link>
      </nav>
    </div>
  );
}