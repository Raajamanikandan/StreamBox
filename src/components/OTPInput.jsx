import React, { useRef, useEffect } from 'react';

const OTPInput = ({ value = '', onChange, length = 6, error, disabled = false }) => {
  const inputRefs = useRef([]);

  // Auto-focus first empty input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Extract only digits
    const cleaned = val.replace(/\D/g, '');

    if (!cleaned) {
      // Clear this digit
      const chars = value.split('');
      chars[index] = '';
      onChange(chars.join(''));
      return;
    }

    const digit = cleaned.slice(-1);
    const chars = (value || '').padEnd(length, ' ').split('');
    chars[index] = digit;
    const nextVal = chars.join('').trimEnd();
    onChange(nextVal);

    // Auto-advance to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (pasteData) {
      onChange(pasteData);
      const targetIndex = Math.min(pasteData.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => {
          const char = value[index] || '';
          return (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={char}
              disabled={disabled}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              aria-label={`Digit ${index + 1}`}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-bg-surface text-text-primary rounded-lg border transition-all duration-200 outline-none select-none ${
                error
                  ? 'border-error ring-1 ring-error'
                  : char
                  ? 'border-blue-prime ring-1 ring-blue-prime/50'
                  : 'border-text-muted/20 focus:border-blue-prime focus:ring-2 focus:ring-blue-prime'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            />
          );
        })}
      </div>
      {error && (
        <p className="text-xs text-error font-medium text-center mt-2.5 animate-fade-in flex items-center justify-center">
          <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default OTPInput;
