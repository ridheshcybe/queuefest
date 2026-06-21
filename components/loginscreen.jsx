'use client';

import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginScreen() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, pwd);
      toast('Welcome back!', 'success');
      console.log(data)
      router.push('/dashboard');
    } catch (err) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <main className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl overflow-hidden shadow-sm border border-[#c2c6d4]">
        {/* Left panel - hidden on mobile */}
        <div className="hidden md:block relative bg-[#00478d] overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&h=600&fit=crop&crop=center')",
            }}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#00478d]/80 via-[#00478d]/40 to-transparent" />
          <div className="relative z-20 h-full p-10 flex flex-col justify-between text-white">
            <div>
              <h1 className="text-[48px] font-bold leading-[56px] tracking-tight mb-4">
                Queue Cure '26
              </h1>
              <p className="text-[18px] leading-[28px] opacity-90 max-w-sm">
                Optimizing clinical workflows with precision and clarity. Manage your patient experience
                effortlessly.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#7df4ff]">verified_user</span>
                <span className="text-[13px] font-semibold leading-[16px]">HIPAA Compliant &amp; Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#7df4ff]">speed</span>
                <span className="text-[13px] font-semibold leading-[16px]">Real-time Synchronization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col justify-center p-10 md:p-24 clinical-pattern">
          <div className="w-full max-w-md mx-auto">
            <div className="md:hidden mb-6">
              <h1 className="text-2xl font-bold text-[#00478d] tracking-tight">Queue Cure '26</h1>
            </div>
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-[#191c21] mb-1">Welcome Back</h2>
              <p className="text-[16px] text-[#424752]">Access your clinical dashboard</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  className="text-[13px] font-semibold leading-[16px] text-[#424752] block"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative focus-ring border border-[#727783] rounded-lg bg-[#f2f3fb] transition-all">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#727783]">
                    mail
                  </span>
                  <input
                    className="w-full h-[48px] bg-transparent border-none focus:ring-0 pl-12 pr-4 text-[16px] text-[#191c21]"
                    id="email"
                    placeholder="name@clinic.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    className="text-[13px] font-semibold leading-[16px] text-[#424752]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-[13px] font-semibold leading-[16px] text-[#00478d] hover:underline decoration-2 underline-offset-4"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative focus-ring border border-[#727783] rounded-lg bg-[#f2f3fb] transition-all">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#727783]">
                    lock
                  </span>
                  <input
                    className="w-full h-[48px] bg-transparent border-none focus:ring-0 pl-12 pr-12 text-[16px] text-[#191c21]"
                    id="password"
                    placeholder="••••••••"
                    required
                    type={showPass ? 'text' : 'password'}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#727783] hover:text-[#00478d] transition-colors"
                    onClick={() => setShowPass(!showPass)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4 py-1">
                <input
                  className="w-5 h-5 rounded border-[#727783] text-[#00478d] focus:ring-[#005eb8] transition-all cursor-pointer"
                  id="remember"
                  type="checkbox"
                />
                <label className="text-[16px] text-[#424752] select-none cursor-pointer" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <button
                className="btn-primary w-full h-[56px] bg-[#00478d] text-white text-[20px] font-semibold leading-[28px] rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Logging in...' : 'Login'}</span>
                <span className="material-symbols-outlined">login</span>
              </button>
            </form>
            <div className="mt-10 pt-6 border-t border-[#c2c6d4] text-center">
              <p className="text-[16px] text-[#424752]">
                New clinic?
                <Link
                  className="text-[#00478d] font-bold hover:underline decoration-2 underline-offset-4 ml-1"
                  href="/signup"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}