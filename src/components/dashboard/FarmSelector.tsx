'use client'

import type { Farm, PestType } from '@/payload-types'

interface FarmSelectorProps {
  farms: Array<Farm & { pestType: PestType }>
  selectedFarmId: string
  onFarmChange: (farmId: string) => void
}

export function FarmSelector({ farms, selectedFarmId, onFarmChange }: FarmSelectorProps) {
  if (farms.length <= 1) {
    return null
  }

  return (
    <select
      value={selectedFarmId}
      onChange={(e) => onFarmChange(e.target.value)}
      className="input py-1 px-3 text-sm"
    >
      {farms.map((farm) => (
        <option key={farm.id} value={String(farm.id)}>
          {farm.name}
        </option>
      ))}
    </select>
  )
}
