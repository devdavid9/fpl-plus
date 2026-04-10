"use client";

import useSWR from "swr";

const API = "/api";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

const FDR_COLOR: Record<number, { bg: string; text: string; dark: boolean }> = {
  1: { bg: "#004d26", text: "#00ff87", dark: false },
  2: { bg: "#1a5e3a", text: "#69f0ae", dark: false },
  3: { bg: "#4a3800", text: "#ffd740", dark: false },
  4: { bg: "#6b2600", text: "#ff9040", dark: false },
  5: { bg: "#6b0000", text: "#ff5555", dark: false },
};

interface FixtureInfo {
  opponent: string;
  difficulty: number;
  home: boolean;
}

interface TickerRow {
  id: number;
  web_name: string;
  is_sub: boolean;
  fixtures: Record<string, FixtureInfo[]>;
}

export default function FixturesView({ teamId }: { teamId: number }) {
  const { data, error, isLoading } = useSWR(
    `${API}/decisions/fixtures/${teamId}`,
    fetcher
  );

  if (isLoading) return <FixturesSkeleton />;
  if (error || !data?.ticker) {
    return (
      <div className="p-8 text-center" style={{ color: "#ef4444", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
        Failed to load fixture data
      </div>
    );
  }

  const gameweeks: number[] = data.gameweeks;
  const ticker: TickerRow[] = data.ticker;
  const starters = ticker.filter((r) => !r.is_sub);

  return (
    <div className="p-4 overflow-x-auto">
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        Next {gameweeks.length} gameweeks — colour = difficulty (green = easy, red = hard)
      </div>

      <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: 500 }}>
        <thead>
          <tr>
            <th
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                textAlign: "left",
                padding: "8px 12px 8px 0",
                borderBottom: "1px solid var(--border)",
                minWidth: 90,
              }}
            >
              Player
            </th>
            {gameweeks.map((gw) => (
              <th
                key={gw}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.08em",
                  padding: "8px 4px",
                  borderBottom: "1px solid var(--border)",
                  textAlign: "center",
                  minWidth: 56,
                }}
              >
                GW{gw}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {starters.map((row, i) => (
            <tr key={row.id}>
              <td
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--foreground)",
                  padding: "6px 12px 6px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  whiteSpace: "nowrap",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                {row.web_name}
              </td>
              {gameweeks.map((gw) => {
                const gwFixtures = row.fixtures[String(gw)] ?? [];
                return (
                  <td
                    key={gw}
                    style={{
                      padding: "4px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <div className="flex flex-col gap-1 items-center">
                      {gwFixtures.length === 0 ? (
                        <span style={{ color: "var(--rank-dim)", fontSize: "10px", fontFamily: "var(--font-mono)" }}>—</span>
                      ) : (
                        gwFixtures.map((f, fi) => {
                          const col = FDR_COLOR[f.difficulty] ?? FDR_COLOR[3];
                          return (
                            <div
                              key={fi}
                              className="fdr-cell"
                              style={{ background: col.bg, color: col.text }}
                            >
                              {f.opponent} {f.home ? "H" : "A"}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FixturesSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-2">
      {[...Array(11)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 36, borderRadius: 4 }} />
      ))}
    </div>
  );
}
