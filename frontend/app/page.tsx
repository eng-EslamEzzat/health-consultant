import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Modern <span className="text-blue-600">Health</span> Consulting
        </h1>
        <p className="text-lg leading-8 text-slate-600">
          Streamline your patient interactions and leverage AI to quickly generate comprehensive, accurate consultation summaries. A smarter way to manage healthcare.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/consultations"
            className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all transform hover:scale-105"
          >
            Go to Consultations
          </Link>
          <Link
            href="/patients/new"
            className="text-sm font-semibold leading-6 text-slate-900 hover:text-blue-600 flex items-center gap-1 group"
          >
            Add a new Patient <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {/* Features Cards */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 ring-1 ring-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Patient Registry</h3>
          </div>
          <p className="text-slate-600 text-sm">Maintain a clear and organized list of all your patients in one central hub.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 ring-1 ring-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-x-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Consultation Logs</h3>
          </div>
          <p className="text-slate-600 text-sm">Log symptoms, diagnoses, and track patient visits effortlessly over time.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 ring-1 ring-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-x-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">AI Summaries</h3>
          </div>
          <p className="text-slate-600 text-sm">Harness the power of AI to convert symptoms and diagnoses into detailed, actionable summaries.</p>
        </div>
      </div>
    </div>
  );
}
