'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const toast = useToast();
  const [clinicName, setClinicName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pwd !== confirmPwd) {
      toast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await signup(clinicName, email, pwd);
      toast('Account created successfully!', 'success');
      router.push('/dashboard');
    } catch (err) {
      toast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <main className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-lg border border-[#c2c6d4] min-h-[819px]">
        {/* Left panel - hidden on mobile */}
        <div className="hidden md:flex md:w-1/2 relative bg-[#005eb8] items-center justify-center p-10">
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 text-white max-w-md">
            <div className="flex items-center gap-2 mb-6">
              <span
                className="material-symbols-outlined text-[48px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                medical_services
              </span>
              <h1 className="text-[20px] leading-[28px] font-extrabold tracking-tight">
                Queue Cure '26
              </h1>
            </div>
            <h2 className="text-[48px] font-bold leading-[56px] tracking-tight mb-4">
              Elevate Your Patient Flow
            </h2>
            <p className="text-[18px] leading-[28px] text-[#c8daff] opacity-90 mb-10">
              Join the modern clinical ecosystem designed for clarity, speed, and trust. Our intelligent
              queue management reduces patient anxiety and optimizes staff efficiency.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="material-symbols-outlined mb-1">bolt</span>
                <h3 className="text-[13px] font-semibold leading-[16px] mb-1">Fast Setup</h3>
                <p className="text-[12px] opacity-80">Deploy your virtual queue in under 5 minutes.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="material-symbols-outlined mb-1">analytics</span>
                <h3 className="text-[13px] font-semibold leading-[16px] mb-1">Live Analytics</h3>
                <p className="text-[12px] opacity-80">Monitor clinic performance in real-time.</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-3/4 h-1/3 opacity-20 transform translate-x-1/4 translate-y-1/4">
            <div
              className="w-full h-full rounded-tl-3xl bg-[#f9f9ff] bg-cover"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&h=600&fit=crop&crop=center')",
              }}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-10 md:px-24">
          <div className="mb-6">
            <div className="flex items-center gap-1 mb-4 md:hidden">
              <span
                className="material-symbols-outlined text-[#00478d]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                medical_services
              </span>
              <span className="text-[20px] leading-[28px] font-bold text-[#00478d]">
                Queue Cure '26
              </span>
            </div>
            <h2 className="text-3xl font-semibold text-[#191c21] mb-1">Get Started</h2>
            <p className="text-[16px] leading-[24px] text-[#424752]">
              Register your clinic or hospital to start managing patients with precision.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-[13px] font-semibold leading-[16px] text-[#424752] mb-1"
                htmlFor="clinic-name"
              >
                Clinic Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#727783]">
                  apartment
                </span>
                <input
                  className="w-full h-[48px] pl-[44px] pr-4 bg-[#f2f3fb] border border-[#c2c6d4] rounded-lg text-[16px] focus:bg-white transition-all"
                  id="clinic-name"
                  placeholder="e.g. St. Mary's General Hospital"
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-[13px] font-semibold leading-[16px] text-[#424752] mb-1"
                htmlFor="admin-email"
              >
                Admin Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#727783]">
                  mail
                </span>
                <input
                  className="w-full h-[48px] pl-[44px] pr-4 bg-[#f2f3fb] border border-[#c2c6d4] rounded-lg text-[16px] focus:bg-white transition-all"
                  id="admin-email"
                  placeholder="admin@clinic.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-[13px] font-semibold leading-[16px] text-[#424752] mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#727783]">
                    lock
                  </span>
                  <input
                    className="w-full h-[48px] pl-[44px] pr-4 bg-[#f2f3fb] border border-[#c2c6d4] rounded-lg text-[16px] focus:bg-white transition-all"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    required
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-[13px] font-semibold leading-[16px] text-[#424752] mb-1"
                  htmlFor="confirm-password"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#727783]">
                    lock_reset
                  </span>
                  <input
                    className="w-full h-[48px] pl-[44px] pr-4 bg-[#f2f3fb] border border-[#c2c6d4] rounded-lg text-[16px] focus:bg-white transition-all"
                    id="confirm-password"
                    placeholder="••••••••"
                    type="password"
                    required
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 py-1">
              <div className="flex items-center h-5">
                <input
                  className="w-4 h-4 rounded border-[#c2c6d4] text-[#00478d] focus:ring-[#005eb8]"
                  id="terms"
                  type="checkbox"
                  required
                />
              </div>
              <label className="text-[14px] text-[#424752] leading-tight" htmlFor="terms">
                I agree to the{' '}
                <a className="text-[#00478d] font-semibold hover:underline" href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a className="text-[#00478d] font-semibold hover:underline" href="#">
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            <button
              className="w-full h-[52px] bg-[#00478d] hover:bg-[#005eb8] text-white font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Creating...' : 'Create Clinic Account'}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
          <p className="mt-10 text-center text-[16px] text-[#424752]">
            Already have a clinic registered?{' '}
            <Link className="text-[#00478d] font-bold hover:underline" href="/">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}