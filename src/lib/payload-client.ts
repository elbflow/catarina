import type { Farm, PestObservation, PestType } from '@/payload-types'
import config from '@/payload.config'
import { getPayload } from 'payload'

export interface ObservationWithRelations extends PestObservation {
  farm: Farm
  pestType: PestType
}

// Server-side functions using Payload Local API
export async function getObservations(
  farmId?: string,
  pestTypeId?: string,
): Promise<ObservationWithRelations[]> {
  const payload = await getPayload({ config })
  
  const where: Record<string, any> = {}
  if (farmId) where.farm = { equals: farmId }
  if (pestTypeId) where.pestType = { equals: pestTypeId }

  const result = await payload.find({
    collection: 'pest-observations',
    where,
    depth: 2,
    sort: '-date',
  })

  return result.docs as ObservationWithRelations[]
}

export async function createObservation(
  data: {
    date: string
    count: number
    farm: string
    pestType: string
    notes?: string
  },
): Promise<PestObservation> {
  const payload = await getPayload({ config })
  
  return await payload.create({
    collection: 'pest-observations',
    data,
  })
}

export async function getFarm(id: string): Promise<Farm> {
  const payload = await getPayload({ config })
  return await payload.findByID({
    collection: 'farms',
    id,
    depth: 0,
  })
}

export async function getFarms(): Promise<Farm[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'farms',
    depth: 0,
  })
  return result.docs
}

export async function getPestType(id: string): Promise<PestType> {
  const payload = await getPayload({ config })
  return await payload.findByID({
    collection: 'pest-types',
    id,
    depth: 0,
  })
}

export async function getPestTypes(): Promise<PestType[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pest-types',
    depth: 0,
  })
  return result.docs
}

// Note: This file is for server-side use only (Server Components, API routes, etc.)
// For client-side API calls, use '@/lib/api-client' instead
