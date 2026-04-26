export default function Logo({ size = 24, className = '', style }) {
  return (
    <svg
      className={`brand-logo ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      style={style}
      aria-hidden="true"
    >
      <path d="M20 30 L152 128 L20 226 Z M236 30 L104 128 L236 226 Z" fillRule="evenodd" />
    </svg>
  );
}
