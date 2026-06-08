// Loading placeholder shaped like the poster grid (shimmer animation in CSS).
export function SkeletonGrid({ cols }) {
  return (
    <div className="grid" style={{ "--cols": cols }} aria-hidden="true">
      {Array.from({ length: cols * 2 }).map((_, i) => (
        <div key={i}>
          <div className="skeleton-poster" />
          <div className="skeleton-line" style={{ width: "70%" }} />
        </div>
      ))}
    </div>
  );
}
