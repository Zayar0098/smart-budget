// lib/storage.ts
import { AppState } from '@/types'

const KEY = 'money-tracker-data-v1'

export function getStorage(): AppState | null {
  try {
    const json = localStorage.getItem(KEY)
    return json ? JSON.parse(json) : null
  } catch {
    return null
  }
}

export function setStorage(data: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Storage error', err)
  }
}
