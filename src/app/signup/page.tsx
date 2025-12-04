import SignUpForm from './SignUpForm';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 px-6 py-10">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Join your studio</p>
          <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
          <p className="text-sm text-gray-600">Enter your studio name and password to get access.</p>
        </div>

        <SignUpForm />
      </div>
    </main>
  );
}
