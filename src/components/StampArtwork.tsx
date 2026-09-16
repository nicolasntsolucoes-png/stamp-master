import type { StampArt } from "@/lib/stamps";

export function StampArtwork({ art, scale = 1 }: { art: StampArt; scale?: number }) {
  return (
    <div
      className="relative overflow-hidden border-[1.5px] border-stamp-ink text-stamp-ink"
      style={{ width: art.width * scale, height: art.height * scale }}
    >
      {art.elements.map((el, i) =>
        el.type === "text" ? (
          <span
            key={i}
            className="absolute whitespace-pre leading-none"
            style={{
              left: el.x * scale,
              top: (el.y - el.size) * scale,
              fontSize: el.size * scale,
              fontWeight: el.bold === false ? 500 : 700,
              fontFamily: "var(--font-stamp)",
              letterSpacing: 0,
            }}
          >
            {el.text}
          </span>
        ) : (
          <span
            key={i}
            className="absolute bg-stamp-ink"
            style={{
              left: el.x * scale,
              top: el.y * scale,
              width: el.width * scale,
              height: Math.max(1, scale),
            }}
          />
        ),
      )}
    </div>
  );
}
