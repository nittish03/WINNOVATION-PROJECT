'use client'

import React, { FormEvent, useState } from 'react';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import toast from 'react-hot-toast';
import { FcGoogle } from "react-icons/fc";
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaEnvelope, 
  FaLock,
  FaShieldAlt,
  FaArrowLeft
} from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';

const SignUpPage = () => {
  const router = useRouter();
  const {data : session} = useSession();
  if(session){
    router.push("/")
  }
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [register, setRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    const loading = toast.loading("Logging in");
    try {
      signIn("google", { callbackUrl: "/" });
      toast.dismiss(loading);
    } catch (error) {
      toast.dismiss(loading);
      toast.error("Failed to Log in, please try again");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setError('Fill all fields!');
      return;
    }
    try {
      setIsLoading(true);
      const loading = toast.loading("Registering");
      const response = await axios.post("/api/auth/register", { username, email, password });
      toast.dismiss(loading);
      if (response) {
        toast.success("OTP SENT SUCCESSFULLY");
        setRegister(true);
      } else {
        toast.dismiss(loading)
        toast.error("Signup Failed");
      }
    } catch (e) {
      toast.error("Signup failed");
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    try {
      setIsLoading(true);
      const loading = toast.loading("Signing in");
      const response = await axios.post("/api/auth/otp-verification", { email, otp });
      toast.dismiss(loading);
      if (response) {
        toast.success("Signed In successfully");
        await signIn("credentials", { email, password, callbackUrl: "/", redirect: true });
        router.push("/login");
      } else {
        toast.error("Failed to sign in");
      }
    } catch (e) {
      toast.error("An error occurred");
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/resend-otp", { email });
      if (response) {
        toast.success("OTP Resent Successfully");
      } else {
        toast.error("Failed to resend OTP");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.log(error);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .gradient-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .input-group {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-group:hover {
          transform: translateY(-2px);
        }

        .floating-label {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          z-index: 2;
        }

        .input-field:focus + .input-icon + .floating-label,
        .input-field:not(:placeholder-shown) + .input-icon + .floating-label {
          top: -8px;
          left: 48px;
          font-size: 12px;
          background: white;
          padding: 0 6px;
          -webkit-text-fill-color: #667eea;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          pointer-events: none;
        }

        .input-field {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding-left: 48px;
          padding-right: 48px;
          padding-top: 16px;
          padding-bottom: 16px;
        }

        .input-field:focus {
          background: white;
          border-color: #667eea;
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.1),
            0 10px 25px -5px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -12px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .pulse-animation {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
          100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
        }

        .slide-in {
          animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .otp-container {
          perspective: 1000px;
        }

        .otp-slot {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #e5e7eb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .otp-slot:focus,
        .otp-slot:focus-within {
          border-color: #667eea;
          background: white;
          transform: rotateY(10deg) scale(1.05);
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.1),
            0 15px 30px -10px rgba(0, 0, 0, 0.2);
        }

        .icon-float {
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }

        .sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .card-enter {
          animation: cardEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(40px) rotateX(10deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
          }
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          z-index: 3;
          color: #9ca3af;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #667eea;
        }

        @media (max-width: 768px) {
          .glass-card {
            margin: 1rem;
          }
        }
      `}</style>

      <div className="min-h-screen w-full flex items-center justify-center gradient-bg">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        </div>

        <div className="w-full max-w-md mx-4 card-enter">
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            {/* Header Sparkle Effect */}
            <div className="absolute top-4 right-4">
              <FaWandMagicSparkles className="text-purple-400 sparkle" />
            </div>

            {!register ? (
              <div className="slide-in">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center icon-float">
                    <FaUser className="text-white text-2xl" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    Create Account
                  </h1>
                  <p className="text-gray-600">Join us today and get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username Field */}
                  <div className="input-group">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder=" "
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField('')}
                        className="input-field w-full rounded-xl text-gray-800 placeholder-transparent outline-none"
                      />
                      <FaUser className={`input-icon transition-colors duration-300 ${focusedField === 'username' ? 'text-purple-500' : 'text-gray-400'}`} />
                      <label className="floating-label">Full Name</label>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="input-group">
                    <div className="relative">
                      <input
                        type="email"
                        placeholder=" "
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className="input-field w-full rounded-xl text-gray-800 placeholder-transparent outline-none"
                      />
                      <FaEnvelope className={`input-icon transition-colors duration-300 ${focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'}`} />
                      <label className="floating-label">Email Address</label>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="input-group">
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder=" "
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        className="input-field w-full rounded-xl text-gray-800 placeholder-transparent outline-none"
                      />
                      <FaLock className={`input-icon transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'}`} />
                      <label className="floating-label">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="password-toggle"
                      >
                        {showPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn-primary w-full py-4 text-white font-semibold rounded-xl relative overflow-hidden disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'CREATE ACCOUNT'
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 space-y-4">
                  <p className="text-center text-gray-600">
                    Already have an account?{' '}
                    <button 
                      onClick={() => redirect('/login')} 
                      className="text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-300"
                    >
                      Sign In
                    </button>
                  </p>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleClick}
                    className="w-full flex items-center justify-center py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:transform hover:scale-[1.02]"
                  >
                    <FcGoogle className="text-2xl mr-3" />
                    <span className="font-medium text-gray-700">Continue with Google</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="slide-in">
                {/* OTP Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center pulse-animation">
                    <FaShieldAlt className="text-white text-2xl" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-gray-600">
                    We've sent a 6-digit code to<br />
                    <span className="font-semibold text-purple-600">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOTP} className="space-y-8">
                  <div className="otp-container">
                    <InputOTP 
                      maxLength={6} 
                      onChange={(value) => {
                        if (/^\d*$/.test(value)) {
                          setOtp(value);
                          setError('');
                        } else {
                          setError("Only numbers allowed");
                        }
                      }}
                    >
                      <InputOTPGroup className="flex justify-center gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="otp-slot w-12 h-14 text-xl font-bold text-center rounded-lg"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading || otp.length !== 6}
                    className="btn-primary w-full py-4 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      'VERIFY OTP'
                    )}
                  </button>

                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Didn't receive the code?{' '}
                      <button 
                        onClick={handleResendOTP}
                        className="text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-300"
                      >
                        Resend Code
                      </button>
                    </p>
                    
                    <button 
                      type="button" 
                      onClick={() => setRegister(false)}
                      className="flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-300 mx-auto"
                    >
                      <FaArrowLeft className="mr-2" />
                      Change Email Address
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
