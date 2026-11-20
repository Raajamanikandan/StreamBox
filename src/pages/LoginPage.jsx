import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Film, Phone, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import OTPInput from '../components/OTPInput';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOtp, verifyOtp, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [formError, setFormError] = useState('');
  const [demoHint, setDemoHint] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const cleanDigits = phoneNumber.replace(/\D/g, '').slice(0, 10);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (cleanDigits.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const res = await sendOtp(cleanDigits);
      setStep(2);
      setCountdown(30);
      setCanResend(false);
      setOtpValue('');
      if (res?.debugOtp) {
        setDemoHint(`Demo OTP: ${res.debugOtp}`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (otpValue.length !== 6) {
      setFormError('Please enter the full 6-digit verification code');
      return;
    }

    try {
      await verifyOtp(cleanDigits, otpValue);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Invalid OTP code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setFormError('');
    try {
      await sendOtp(cleanDigits);
      setCountdown(30);
      setCanResend(false);
      setOtpValue('');
    } catch (err) {
      setFormError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      {/* Centered card #232F3E on #0F171E background */}
      <div className="w-full max-w-md bg-bg-surface border border-text-muted/20 rounded-lg shadow-2xl p-6 sm:p-10 space-y-8 animate-fade-in">
        {/* App Logo & Name on top */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded bg-blue-prime flex items-center justify-center text-text-primary mb-3 shadow-lg">
            <Film className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-text-primary">
            STREAM<span className="text-blue-prime">BOX</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Sign in to stream unlimited movies & original shows
          </p>
        </div>

        {/* Step 1: 10-Digit Mobile Number Input with strict validation */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Mobile Number (10 Digits)
                </label>
                <span className={`text-[11px] font-mono ${cleanDigits.length === 10 ? 'text-success' : 'text-text-muted'}`}>
                  {cleanDigits.length}/10
                </span>
              </div>

              <div className="relative">
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number (e.g. 9876500001)"
                  value={phoneNumber}
                  onKeyDown={(e) => {
                    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
                    if (e.ctrlKey || e.metaKey || allowedKeys.includes(e.key)) {
                      return;
                    }
                    if (!/^\d$/.test(e.key) || phoneNumber.length >= 10) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(pasted);
                    if (formError) setFormError('');
                  }}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(onlyNums);
                    if (formError) setFormError('');
                  }}
                  icon={Phone}
                  error={formError}
                  autoFocus
                />
              </div>

              <p className="text-[11px] text-text-muted">
                Enter your registered 10-digit mobile number. Demo OTP is <span className="text-blue-prime font-mono">123456</span>.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-base"
              disabled={cleanDigits.length !== 10}
            >
              Send OTP
            </Button>
          </form>
        )}

        {/* Step 2: 6-box OTP input with auto-focus & paste support */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFormError('');
                  setDemoHint('');
                }}
                className="inline-flex items-center text-xs font-medium text-text-muted hover:text-blue-prime transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Change number
              </button>
              <span className="text-xs text-text-muted font-medium">{fullPhone}</span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted text-center">
                Enter 6-Digit OTP Code
              </label>

              <OTPInput
                value={otpValue}
                onChange={(val) => {
                  setOtpValue(val);
                  if (formError) setFormError('');
                  // Auto verify once 6 digits are typed
                  if (val.length === 6) {
                    // Slight delay for smooth UX
                    setTimeout(() => {
                      verifyOtp(fullPhone, val).catch(() => {});
                    }, 100);
                  }
                }}
                error={formError}
                disabled={isLoading}
              />

              {demoHint && (
                <div className="bg-bg-base/70 border border-blue-prime/30 rounded-lg p-2.5 text-center text-xs text-blue-prime font-semibold">
                  {demoHint}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={otpValue.length !== 6}
              className="w-full text-base"
            >
              Verify & Sign In
            </Button>

            {/* 30s resend countdown */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs font-semibold text-blue-prime hover:text-blue-bright transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-prime rounded"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend OTP Code
                </button>
              ) : (
                <p className="text-xs text-text-muted">
                  Resend code in{' '}
                  <span className="text-text-primary font-semibold">{countdown}s</span>
                </p>
              )}
            </div>
          </form>
        )}

        {/* Footer info within card */}
        <div className="pt-4 border-t border-text-muted/20 text-center">
          <p className="text-[11px] text-text-muted">
            By signing in, you agree to StreamBox Terms of Use and Privacy Notice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
