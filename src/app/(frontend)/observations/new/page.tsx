import { getFarms, getPestTypes } from '@/lib/payload-client'
import { ObservationForm } from '@/components/forms/ObservationForm'
import Link from 'next/link'

export default async function NewObservationPage() {
  const farms = await getFarms()
  const pestTypes = await getPestTypes()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">🐞</Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Add Observation</h1>
              <p className="text-sm text-gray-500">Record a new pest trap count</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {farms.length === 0 || pestTypes.length === 0 ? (
          <div className="card text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Setup Required</h2>
            <p className="text-gray-600 mb-6">
              Please create at least one farm and pest type before adding observations.
            </p>
            <Link href="/admin" className="btn-primary">
              Open Admin Panel
            </Link>
          </div>
        ) : (
          <div className="card">
            <ObservationForm
              farms={farms}
              pestTypes={pestTypes}
              defaultFarmId={String(farms[0]?.id)}
              defaultPestTypeId={String(pestTypes[0]?.id)}
            />
          </div>
        )}
      </main>
    </div>
  )
}
