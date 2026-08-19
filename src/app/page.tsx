import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 font-sans px-4 py-12">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center">
        {/* Logo/Brand Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
              <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-4xl font-extrabold text-[#152234]">
              Testify<span className="text-[#0092E3]">.</span>
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-[#152234] mb-4">
            Online Assessment Platform
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Secure online assessments, automated evaluation, and performance
            analytics for modern education.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href="/auth/register"
            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-[#0092E3] to-[#5B67F7] text-white font-semibold shadow-lg shadow-[#0092E3]/30 hover:shadow-xl hover:shadow-[#0092E3]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="flex-1 py-4 px-6 rounded-xl border-2 border-[#0092E3] text-[#0092E3] font-semibold hover:bg-[#EBF7FF] transition-all duration-200 text-center"
          >
            Sign In
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 p-6 card-hover-effect">
            <div className="w-12 h-12 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-[#0092E3]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#152234] mb-2">
              Secure Assessments
            </h3>
            <p className="text-slate-600 text-sm">
              Enterprise-grade security for all your examinations and tests.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 p-6 card-hover-effect">
            <div className="w-12 h-12 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-[#0092E3]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#152234] mb-2">
              Instant Results
            </h3>
            <p className="text-slate-600 text-sm">
              Automated evaluation with immediate feedback and analytics.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 p-6 card-hover-effect">
            <div className="w-12 h-12 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-[#0092E3]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#152234] mb-2">
              Performance Analytics
            </h3>
            <p className="text-slate-600 text-sm">
              Detailed insights and progress tracking for students and
              educators.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
