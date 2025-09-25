import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Send, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error

  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const userType = location.state?.userType || 'USER';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (!otpString || otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.verifyOTP({
        email,
        otp: otpString
      });

      if (result.data.success) {
        setVerificationStatus('success');
        toast.success('Email verified successfully!');

        // Redirect to sign in page
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setVerificationStatus('error');
        toast.error(result.data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setVerificationStatus('error');
      toast.error('Verification failed. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const result = await authAPI.sendOTP({
        email,
        purpose: 'verification'
      });

      if (result.data.success) {
        toast.success('OTP sent successfully!');
        setCountdown(60);
        setCanResend(false);

        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                to="/signup"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Sign Up
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {verificationStatus === 'success' ? (
                // Success State
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h1>
                  <p className="text-gray-600 mb-6">
                    Your email has been successfully verified. You will be redirected to the sign-in page shortly.
                  </p>
                  <div className="animate-pulse text-blue-600">
                    Redirecting...
                  </div>
                </div>
              ) : (
                // Verification Form
                <>
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h1>
                    <p className="text-gray-600 mb-2">
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="text-blue-600 font-medium text-lg">{email}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                        Enter Verification Code
                      </label>
                      <div className="flex justify-center space-x-3">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                            maxLength={1}
                            pattern="[0-9]"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.join('').length !== 6}
                      className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                        isLoading || otp.join('').length !== 6
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]'
                      } shadow-lg hover:shadow-xl`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CheckCircle size={20} className="mr-2" />
                          Verify Email
                        </div>
                      )}
                    </button>
                  </form>
                </>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-2">Didn't receive the code?</p>
                {canResend ? (
                  <button
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                ) : (
                  <p className="text-gray-500">
                    Resend code in {formatTime(countdown)}
                  </p>
                )}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/signup')}
                  className="text-gray-600 hover:text-gray-700"
                >
                  ← Back to Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmailPage;
