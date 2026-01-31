import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Login - Catarina',
  description: 'Log in to your Catarina account',
}

export default function LoginPage() {
  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🐞</div>
        <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
        <p className="text-gray-600">Log in to your account to continue</p>
      </div>
      <LoginForm />
    </div>
  )
}
