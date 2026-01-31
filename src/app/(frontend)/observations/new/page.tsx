import { getFarms, getPestTypes } from '@/lib/payload-client'
import { ObservationForm } from '@/components/forms/ObservationForm'

export default async function NewObservationPage() {
  const farms = await getFarms()
  const pestTypes = await getPestTypes()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Observation</h1>
          <p className="text-gray-600">Record a new pest trap count</p>
        </div>

        {farms.length === 0 || pestTypes.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              Please create at least one farm and pest type in the admin panel before adding
              observations.
            </p>
          </div>
        ) : (
          <ObservationForm
            farms={farms}
            pestTypes={pestTypes}
            defaultFarmId={farms[0]?.id}
            defaultPestTypeId={pestTypes[0]?.id}
          />
        )}
      </div>
    </div>
  )
}
