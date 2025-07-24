'use client'

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from "react-icons/fc";
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaEnvelope, 
  FaLock,
  FaSignInAlt,
} from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

    if (!email || !password) {
      setError("Fill all fields!");
      return;
    }
    if (!email.includes("@") || !email.includes(".") || email.length > 100) {
      setError("Invalid email, must include @ and domain!");
      return;
    }

    setIsLoading(true);
    const loading = toast.loading("Signing in");
    try {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
      toast.dismiss(loading);
      toast.success("Signed in successfully");
    } catch (error) {
      toast.dismiss(loading);
      toast.error("Failed to sign in");
    } finally {
      setIsLoading(false);
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

        .welcome-text {
          background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(102, 126, 234, 0.6);
          }
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

            <div className="slide-in">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center icon-float pulse-glow">
                  <FaSignInAlt className="text-white text-2xl" />
                </div>
                <h1 className="text-3xl font-bold welcome-text mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button 
                    type="button"
                    className="text-sm text-purple-600 hover:text-purple-700 transition-colors duration-300"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary w-full py-4 text-white font-semibold rounded-xl relative overflow-hidden disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'SIGN IN'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 space-y-4">
                <p className="text-center text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => router.push('/signup')} 
                    className="text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-300"
                  >
                    Sign Up
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
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
