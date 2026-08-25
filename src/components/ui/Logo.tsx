import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  href?: string;
}

export function TestifyLogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="globalTopRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A2FF" />
          <stop offset="60%" stopColor="#0072FF" />
          <stop offset="100%" stopColor="#0052EA" />
        </linearGradient>
        <linearGradient id="globalTopFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#005BDB" />
          <stop offset="100%" stopColor="#003FA8" />
        </linearGradient>
        <linearGradient id="globalStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#004AD6" />
        </linearGradient>
        <linearGradient id="globalBlueCheckGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0052EA" />
          <stop offset="50%" stopColor="#007CFF" />
          <stop offset="100%" stopColor="#00AFFF" />
        </linearGradient>
      </defs>

      {/* 1. Vertical Stem of T */}
      <rect
        x="33"
        y="22"
        width="31"
        height="64"
        rx="15.5"
        fill="url(#globalStemGrad)"
      />

      {/* 2. Top Horizontal Bar of T */}
      <path
        d="M10 24C10 13.5 18.5 5 29 5H82C89.5 5 95 10.5 95 18C95 24.5 89.5 29 82 29H36L10 24Z"
        fill="url(#globalTopRibbonGrad)"
      />

      {/* 3. Top Left Fold Shadow */}
      <path
        d="M10 24C10 17 14 11 20 8L36 29H20C14.5 29 10 26.5 10 24Z"
        fill="url(#globalTopFoldGrad)"
        opacity="0.85"
      />

      {/* 4. Right Blue Checkmark Wing */}
      <path
        d="M58 66L89 36C92.5 32.5 98 33 99.5 37.5C100.5 40.5 99 44 96 47L64 78C60.5 81.5 54.5 81.5 51 78L58 66Z"
        fill="url(#globalBlueCheckGrad)"
      />

      {/* 5. Front White Checkmark */}
      <path
        d="M34 56C36.5 53 41 52.5 44.5 55L58 66C61 69 61 74 57.5 77C54 80 49 80 46 76.5L34.5 64C32 61.5 32 58 34 56Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function Logo({
  size = 36,
  className = "",
  showText = true,
  textClassName = "",
  href,
}: LogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
      <TestifyLogoIcon size={size} />
      {showText && (
        <span
          className={`text-2xl font-extrabold tracking-tight font-display transition-colors ${
            textClassName || "text-[#0B2238] dark:text-white"
          }`}
        >
          Testify
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
