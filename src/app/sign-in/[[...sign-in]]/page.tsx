import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-card rounded-2xl border border-border',
            headerTitle: 'text-slate-900',
            headerSubtitle: 'text-slate-500',
            formButtonPrimary: 'bg-pilot-600 hover:bg-pilot-700',
          },
        }}
        forceRedirectUrl="/apply"
        signUpUrl="/sign-up"
      />
    </div>
  )
}
