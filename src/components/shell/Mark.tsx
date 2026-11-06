/** Registration mark: the site's logo. Decorative; the name beside it carries the accessible text. */
export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="16" r="9.5" />
      <path d="M16 2v9M16 21v9M2 16h9M21 16h9" />
      <circle cx="16" cy="16" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
