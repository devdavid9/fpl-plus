"use client";

import useSWR from "swr";

const API = "/api";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

function diffBadge(diff: number) {
  const colors =
    diff <= 2 ? { bg: "#004d2666", text: "#00ff87" }
    : diff <= 3 ? { bg: "#ffd74022", text: "#ffd740" }
    : diff <= 4 ? { bg: "#ff6d0022", text: "#ff9040" }
    : { bg: "#d5000033", text: "#ff5555" };
  return colors;
}

interface PlayerOut {
  id: number;
  web_name: string;
  team_short: string;
  avg_difficulty: number;
  price: number;
}

interface PlayerIn {
  id: number;
  web_name: string;
  team_short: string;
  avg_difficulty: number;
  price: number;
  form: number;
}

interface Suggestion {
  out: PlayerOut;
  in: PlayerIn[];
}

export default function TransfersView({ teamId }: { teamId: number }) {
  const { data, error, isLoading } = useSWR(
    `${API}/decisions/transfers/${teamId}`,
    fetcher
  );

  if (isLoading) return <TransfersSkeleton />;
  if (error || !data) {
    return (
      <div className="p-8 text-center" style={{ color: "#ef4444", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
        Failed to load transfer data
      </div>
    );
  }

  const suggestions: Suggestion[] = data.suggestions ?? [];

  if (suggestions.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <div
          style={{
            fontSize: "32px",
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            color: "var(--primary)",
            letterSpacing: "0.04em",
          }}
        >
          All Good
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--muted-foreground)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          No urgent transfers needed — your squad has favourable fixtures
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          marginBottom: "2px",
        }}
      >
        {data.gameweeks_ahead} GW lookahead — players with avg difficulty &gt; 3.5
      </div>

      {suggestions.map((s) => {
        const outBadge = diffBadge(s.out.avg_difficulty);
        return (
          <div key={s.out.id} className="transfer-card">
            {/* OUT player */}
            <div className="flex items-center gap-3 mb-4">
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.1)",
                  borderRadius: "3px",
                  padding: "3px 8px",
                }}
              >
                OUT
              </div>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--foreground)",
                  }}
                >
                  {s.out.web_name}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--muted-foreground)",
                    marginLeft: "8px",
                  }}
                >
                  {s.out.team_short} · £{s.out.price.toFixed(1)}m
                </span>
              </div>
              <div
                style={{
                  background: outBadge.bg,
                  color: outBadge.text,
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "4px",
                  padding: "4px 8px",
                }}
              >
                FDR {s.out.avg_difficulty.toFixed(1)}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: "100%",
                height: "1px",
                background: "rgba(255,255,255,0.05)",
                marginBottom: "12px",
              }}
            />

            {/* IN candidates */}
            <div className="flex flex-col gap-2">
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  marginBottom: "4px",
                }}
              >
                Suggested replacements
              </div>
              {s.in.map((p, i) => {
                const inBadge = diffBadge(p.avg_difficulty);
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: i === 0 ? "var(--primary-bg-subtle)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${i === 0 ? "var(--primary-border-subtle)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: "6px",
                      padding: "10px 12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: i === 0 ? "var(--primary)" : "var(--rank-dim)",
                        minWidth: "14px",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "14px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: i === 0 ? "var(--primary)" : "var(--foreground)",
                        }}
                      >
                        {p.web_name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          color: "var(--muted-foreground)",
                          marginLeft: "8px",
                        }}
                      >
                        {p.team_short} · £{p.price.toFixed(1)}m
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        Form {p.form.toFixed(1)}
                      </span>
                      <div
                        style={{
                          background: inBadge.bg,
                          color: inBadge.text,
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          fontWeight: 700,
                          borderRadius: "3px",
                          padding: "3px 6px",
                        }}
                      >
                        FDR {p.avg_difficulty.toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TransfersSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 180, borderRadius: 8 }} />
      ))}
    </div>
  );
}
