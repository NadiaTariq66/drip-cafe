export function SvgDefs() {
  return (
    <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
      <symbol id="bean" viewBox="0 0 40 26">
        <ellipse cx="20" cy="13" rx="19" ry="12" fill="currentColor" />
        <path
          d="M20 2 C 26 8, 14 18, 20 24"
          stroke="rgba(13,11,9,.55)"
          strokeWidth="2.5"
          fill="none"
        />
      </symbol>
      <symbol id="star" viewBox="0 0 24 24">
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
      </symbol>
    </svg>
  )
}
