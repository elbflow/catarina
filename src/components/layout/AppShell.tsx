import type { Farm, PestType, User } from '@/payload-types'
import { Header } from './Header'

interface AppShellProps {
  user: User
  children: React.ReactNode
  farm?: Farm & { pestType: PestType }
}

export function AppShell({ user, children, farm }: AppShellProps) {
  const farmName = farm?.name
  const pestTypeName = typeof farm?.pestType === 'object' ? farm.pestType.name : undefined

  return (
    <div className="min-h-screen">
      <Header user={user} farmName={farmName} pestTypeName={pestTypeName} />
      {children}
    </div>
  )
}
