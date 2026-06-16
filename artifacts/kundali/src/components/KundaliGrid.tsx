import React from "react";
import type { HouseInfo, PlanetInfo } from "@workspace/api-client-react";

interface KundaliGridProps {
  houses: HouseInfo[];
  planets: PlanetInfo[];
  className?: string;
}

/**
 * North-Indian Kundali grid — 480×480 viewBox.
 *
 * House layout (counter-clockwise from top-centre):
 *
 *    12 | 11 | 10
 *  ─────────────────
 *   1  |  ◇  |  9
 *       |     |
 *   2  |  ◇  |  8
 *  ─────────────────
 *     3 |  4  |  7
 *         5
 *
 * H1 = top inner (lagna), H7 = bottom outer, etc.
 */

// Cell centres — scaled to 480×480 viewBox.
// These match the original 400×400 positions × 1.2, which produced the correct grid.
const HOUSE_CENTER: Record<number, { x: number; y: number }> = {
   1: { x: 240, y: 120 },
   2: { x: 120, y:  42 },
   3: { x:  42, y: 120 },
   4: { x: 120, y: 240 },
   5: { x:  42, y: 360 },
   6: { x: 120, y: 438 },
   7: { x: 240, y: 360 },
   8: { x: 360, y: 438 },
   9: { x: 438, y: 360 },
  10: { x: 360, y: 240 },
  11: { x: 438, y: 120 },
  12: { x: 360, y:  42 },
};

// Sign number label offset from cell centre
const SIGN_OFFSET: Record<number, { dx: number; dy: number }> = {
   1: { dx:   0, dy: -42 },
   2: { dx: -22, dy:   0 },
   3: { dx:   0, dy: -22 },
   4: { dx:   0, dy: -42 },
   5: { dx:   0, dy:  22 },
   6: { dx: -22, dy:   0 },
   7: { dx:   0, dy:  42 },
   8: { dx:  22, dy:   0 },
   9: { dx:   0, dy:  22 },
  10: { dx:   0, dy:  42 },
  11: { dx:   0, dy: -22 },
  12: { dx:  22, dy:   0 },
};

// Pixels between consecutive planet lines in a cell
const LINE_H = 18;

export function KundaliGrid({ houses, planets, className = "" }: KundaliGridProps) {
  // Group planets by house
  const byHouse: Record<number, PlanetInfo[]> = {};
  planets.forEach(p => {
    if (!byHouse[p.house]) byHouse[p.house] = [];
    byHouse[p.house].push(p);
  });

  return (
    <div className={`relative w-full max-w-lg mx-auto aspect-square ${className}`}>
      <svg
        viewBox="0 0 480 480"
        className="w-full h-full"
        aria-label="Rasi Chart"
      >
        {/* ── Grid lines ─────────────────────────────────────────────── */}
        <g fill="none" stroke="#ff4d00" strokeWidth="1.8" strokeLinejoin="round">
          {/* Outer square */}
          <rect x="1" y="1" width="478" height="478" />
          {/* Main diagonals */}
          <line x1="1" y1="1" x2="479" y2="479" />
          <line x1="479" y1="1" x2="1" y2="479" />
          {/* Inner diamond — midpoints of outer square */}
          <polygon points="240,1 479,240 240,479 1,240" />
        </g>

        {/* ── House cells ────────────────────────────────────────────── */}
        {houses.map(house => {
          const h = house.number;
          const c = HOUSE_CENTER[h];
          const so = SIGN_OFFSET[h];
          const pts = byHouse[h] ?? [];

          // Vertically centre the planet block around the cell centre
          const blockH = pts.length * LINE_H;
          const startY = c.y - blockH / 2 + LINE_H / 2;

          return (
            <g key={`h-${h}`}>
              {/* Sign number (faint, in corner of cell) */}
              <text
                x={c.x + so.dx}
                y={c.y + so.dy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="rgba(255,255,255,0.35)"
                stroke="none"
                fontFamily="Outfit, sans-serif"
              >
                {house.signIndex + 1}
              </text>

              {/* Planet labels — one per line so nothing overflows */}
              {pts.map((p, i) => (
                <text
                  key={p.name}
                  x={c.x}
                  y={startY + i * LINE_H}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="500"
                  fill="hsl(40 50% 92%)"
                  stroke="none"
                  fontFamily="Outfit, sans-serif"
                >
                  {p.symbol} {p.name.substring(0, 2)}{p.isRetrograde ? "ᴿ" : ""}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
