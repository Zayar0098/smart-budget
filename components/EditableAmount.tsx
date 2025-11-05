'use client'
import { useState } from 'react'

interface EditableAmountProps {
  value: number
  onSave: (newValue: number) => void
}

export default function EditableAmount({ value, onSave }: EditableAmountProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value.toString())

  const handleSave = () => {
    const newValue = parseFloat(tempValue)
    if (!isNaN(newValue)) onSave(newValue)
    setIsEditing(false)
  }

  return (
    <div>
      {isEditing ? (
        <input
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="border rounded px-2 py-1 w-24"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:underline"
        >
          ¥{value.toLocaleString()}
        </span>
      )}
    </div>
  )
}
