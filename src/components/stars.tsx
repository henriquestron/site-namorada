import type { CSSProperties } from "react";

// Deterministic positions keep the server and client renders identical.
export function Stars() {
  return (
    <div className="star-field" aria-hidden="true">
      {Array.from({ length: 65 }, (_, i) => (
        <span key={i} className="star" style={{
          left: `${((i * 73.37 + 11) % 100).toFixed(2)}%`,
          top: `${((i * 37.19 + 7) % 100).toFixed(2)}%`,
          "--size": `${i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1}px`,
          "--duration": `${4 + (i % 6)}s`,
          "--delay": `${-(i % 11)}s`,
        } as CSSProperties} />
      ))}
      <span className="shooting-star" />
    </div>
  );
}
