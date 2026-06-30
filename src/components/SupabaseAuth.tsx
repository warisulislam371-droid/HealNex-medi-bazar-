import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { dbLocal } from '../db';
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Activity,
  CheckCircle,
  AlertCircle,
  LockKeyhole
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SupabaseAuthProps {
  currentRoute: string;
  navigate: (to: string) => void;
  onLoginSuccess: (user: User) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SupabaseAuth({
  currentRoute,
  navigate,
  onLoginSuccess,
  addToast
}: SupabaseAuthProps) {
  // Common states
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email+Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone OTP state
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Update password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // General error/info state
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkActiveSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          let userRole = 'customer';
          if (session.user.email === 'warisulislam371@gmail.com') {
            userRole = 'admin';
          } else {
            try {
              const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
              if (user?.role) {
                userRole = user.role;
              }
            } catch (err) {
              console.error('Error fetching role, defaulting:', err);
              userRole = 'customer';
            }
          }

          const matchedUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Verified User',
            email: session.user.email || '',
            role: userRole as UserRole,
            createdAt: session.user.created_at || new Date().toISOString()
          };
          onLoginSuccess(matchedUser);

          if (userRole === 'admin') {
            navigate('/AdminPanel');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error checking active session:', err);
      }
    };

    checkActiveSession();
  }, []);

  // Handle Fetching role and logging in user
  const handleUserSession = async (authUser: any) => {
    try {
      let userRole = 'customer';
      let userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Verified User';

      if (authUser.email === 'warisulislam371@gmail.com') {
        userRole = 'admin';
      } else {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', authUser.id)
            .single();

          if (error) throw error;
          if (data) {
            userRole = data.role || 'customer';
            if (data.name) userName = data.name;
          }
        } catch (dbErr) {
          console.error('DB error fetching user session:', dbErr);
          userRole = 'customer';
        }
      }

      const matchedUser: User = {
        id: authUser.id,
        name: userName,
        email: authUser.email || '',
        role: userRole as UserRole,
        createdAt: authUser.created_at || new Date().toISOString()
      };

      onLoginSuccess(matchedUser);
      addToast(`Access granted! Signed in as ${matchedUser.name}`, 'success');

      // Routing logic based on role
      if (userRole === 'admin' || userRole === 'super_admin') {
        navigate('/AdminPanel');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      addToast(err.message || 'Error parsing session information.', 'error');
    }
  };

  // 1. Email + Password login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        await handleUserSession(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
      addToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Phone OTP: send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMsg('Please input a valid phone number with country code (e.g. +919876543210)');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone
      });

      if (error) throw error;

      setOtpSent(true);
      addToast('A security code has been dispatched to your mobile number via SMS.', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error dispatching OTP. Check phone number layout.');
      addToast(err.message || 'Failed to dispatch OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Phone OTP: verify OTP token
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) {
      setErrorMsg('Please enter the 6-digit confirmation code.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otpToken,
        type: 'sms'
      });

      if (error) throw error;

      if (data?.user) {
        await handleUserSession(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired confirmation token.');
      addToast(err.message || 'Verification failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Reset Password for Email handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const redirectUrl = 'https://healnex-medi-bazar-171140813787.asia-southeast1.run.app/update-password';
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      setForgotSent(true);
      addToast('A secure recovery token link has been dispatched to your inbox.', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset request failed.');
      addToast(err.message || 'Unable to start reset workflow.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 5. Update Password handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both inputs.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordUpdated(true);
      addToast('Security credentials updated successfully!', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Credential modification failed.');
      addToast(err.message || 'Unable to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypassLogin = (role: 'customer' | 'vendor' | 'super_admin') => {
    const users = dbLocal.getUsers();
    const match = users.find(u => u.role === role);
    if (match) {
      dbLocal.setCurrentUser(match);
      onLoginSuccess(match);
      addToast(`Sandbox Access: Authenticated as ${match.name}!`, 'success');
      
      if (role === 'super_admin') {
        navigate('/AdminPanel');
      } else if (role === 'vendor') {
        navigate('/VendorPanel');
      } else {
        navigate('/marketplace');
      }
    } else {
      addToast('Preset demo user not found in local DB.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-2">
          <div className="bg-teal-600 p-2.5 rounded-xl shadow-lg shadow-teal-900/30">
            <Activity className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white font-display">
              Heal<span className="text-teal-400">Nex</span>
            </h2>
            <p className="text-[10px] text-teal-300/80 font-bold tracking-widest uppercase -mt-1">
              Medi Bazar • Clinical Hub
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-950/70 border border-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          
          {/* Header section based on view */}
          {currentRoute === '/forgot-password' && (
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-white">Reset Secure Access</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your email address to retrieve your HealNex medical portal access link.
              </p>
            </div>
          )}

          {currentRoute === '/update-password' && (
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-white">Upgrade Credentials</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please enter a secure password to unlock your clinical portal access.
              </p>
            </div>
          )}

          {currentRoute === '/login' && (
            <div className="mb-6 flex flex-col items-center">
              <h3 className="text-lg font-bold text-white">Secure Authorization Portal</h3>
              <p className="text-xs text-slate-400 mt-1 text-center">
                Access your procurement, vendor marketplace, or administration cockpit.
              </p>
              
              {/* Login Method Toggle */}
              <div className="flex w-full bg-slate-900 p-1 rounded-xl mt-5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsPhoneMode(false); setErrorMsg(''); }}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    !isPhoneMode
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPhoneMode(true); setErrorMsg(''); }}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    isPhoneMode
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Phone SMS OTP
                </button>
              </div>
            </div>
          )}

          {/* Feedback message indicator */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {currentRoute === '/forgot-password' && (
            forgotSent ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-800">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Recovery Token Dispatched</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Check your email inbox at <strong className="text-slate-200">{forgotEmail}</strong>. Follow the custom redirect instructions to establish your secure passkey.
                  </p>
                </div>
                <button
                  onClick={() => { setForgotSent(false); setForgotEmail(''); navigate('/login'); }}
                  className="mt-4 text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <span>Return to Login Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1.5 text-xs font-semibold">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute top-3.5 left-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="doctor.sharma@hospital.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-600 rounded-xl p-3 pl-9 outline-none text-white text-xs font-medium transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-teal-900/30 transition flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {loading ? 'Dispatched Request...' : 'Send Recovery Credentials'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-xs text-slate-400 hover:text-white transition"
                  >
                    Back to Secure Authorization
                  </button>
                </div>
              </form>
            )
          )}

          {/* VIEW: UPDATE PASSWORD */}
          {currentRoute === '/update-password' && (
            passwordUpdated ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-800">
                  <LockKeyhole className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Passphrase Modified</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Your secure credential update has been committed to Supabase. Redirecting to access panel...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1.5 text-xs font-semibold">New Secure Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute top-3.5 left-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-600 rounded-xl p-3 pl-9 outline-none text-white text-xs font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1.5 text-xs font-semibold">Confirm Password Entry</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute top-3.5 left-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-600 rounded-xl p-3 pl-9 outline-none text-white text-xs font-medium transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {loading ? 'Committing changes...' : 'Establish Secure Passphrase'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )
          )}

          {/* VIEW: LOGIN (EMAIL OR PHONE SMS OTP) WHEN SUPABASE IS CONFIGURED */}
          {currentRoute === '/login' && isSupabaseConfigured && !isPhoneMode && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1.5 text-xs font-semibold">Clinical / Vendor Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute top-3.5 left-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. buyer@hospital.com"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-teal-600 rounded-xl p-3 pl-9 outline-none text-white text-xs font-medium transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-400 text-xs font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[10px] text-teal-400 hover:text-teal-300 font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute top-3.5 left-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-teal-600 rounded-xl p-3 pl-9 outline-none text-white text-xs font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-teal-900/30 transition flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {loading ? 'Authorizing Access...' : 'Authenticate Credentials'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Continue Shopping as Guest
                </button>
              </div>
            </form>
          )}

          {/* VIEW: LOGIN PHONE OTP WHEN SUPABASE IS CONFIGURED */}
          {currentRoute === '/login' && isSupabaseConfigured && isPhoneMode && (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1.5 text-xs font-semibold">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute top-3.5 left-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +919876543210"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-600 rounded-xl p-3 pl-9 outline-none text-white text-xs font-medium transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    Must include international dialing prefix (e.g., +91 for India). A 6-digit passcode will be dispatched.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-teal-900/30 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {loading ? 'Dispatching OTP SMS...' : 'Request OTP SMS'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center mt-6 pt-4 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => navigate('/marketplace')}
                    className="text-xs text-slate-400 hover:text-white transition"
                  >
                    Continue Shopping as Guest
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="mb-2 text-center">
                    <p className="text-xs text-emerald-400">Security key sent to <strong className="text-slate-100">{phone}</strong></p>
                  </div>
                  <label className="text-slate-400 block mb-1.5 text-xs font-semibold">6-Digit Confirmation Passcode</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute top-3.5 left-3" />
                    <input
                      type="text"
                      required
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="e.g. 123456"
                      maxLength={6}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-600 rounded-xl p-3 pl-9 outline-none text-white text-xs font-mono font-bold transition text-center tracking-widest text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {loading ? 'Confirming code...' : 'Confirm OTP Token'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpToken(''); }}
                    className="text-[10px] text-teal-400 hover:text-teal-300 font-bold"
                  >
                    Resend to another number
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/marketplace')}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Guest mode
                  </button>
                </div>
              </form>
            )
          )}

          {/* VIEW: LOGIN WHEN SUPABASE IS NOT CONFIGURED */}
          {currentRoute === '/login' && !isSupabaseConfigured && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-950/30 border border-amber-900/60 rounded-2xl text-amber-300 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
                  <span>SUPABASE OFFLINE DEMO PORTAL</span>
                </div>
                <p>
                  To enable real Auth, configure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> secrets in AI Studio.
                </p>
                <p className="opacity-80">
                  The app is running in offline <strong>Sandbox Mode</strong>. Authenticate instantly as any preset user role below:
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <button
                  type="button"
                  onClick={() => handleDemoBypassLogin('super_admin')}
                  className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-600 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-teal-400">Log in as Super Admin</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Control center, audit logs, approvals</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoBypassLogin('vendor')}
                  className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-600 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-400">Log in as Supplier Partner</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Product listings, quotes & RFQs</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoBypassLogin('customer')}
                  className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-orange-400">Log in as Hospital Buyer</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Place orders, raise RFQs & support</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition" />
                </button>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Continue Shopping as Guest
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
