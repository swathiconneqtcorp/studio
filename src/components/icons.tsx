import React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 14.5A2.5 2.5 0 1 0 8 20a2.5 2.5 0 0 0 0-5.5Z" />
      <path d="M16 4.5a2.5 2.5 0 1 0 0 5.5 2.5 2.5 0 0 0 0-5.5Z" />
      <path d="M6 7L18 17" />
    </svg>
  );
}
