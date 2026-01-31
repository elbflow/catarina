import { SignupForm } from '@/components/auth/SignupForm'

export const metadata = {
  title: 'Sign Up - Catarina',
  description: 'Create a new Catarina account',
}

export default function SignupPage() {
  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🐞</div>
        <h1 className="text-2xl font-semibold mb-2">Get Started</h1>
        <p className="text-gray-600">Create your account to start tracking pests</p>
      </div>
      <SignupForm />
    </div>
  )
}
