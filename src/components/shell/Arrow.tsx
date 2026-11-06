/** Thin long arrow as inline SVG (the serif font has no arrow glyph, so text arrows would fall back to another font). */
export function Arrow({ className, direction = "right" }: { className?: string; direction?: "right" | "left" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 12"
      width="40"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M0 6h38M32 1l6 5-6 5" />
    </svg>
  );
}
