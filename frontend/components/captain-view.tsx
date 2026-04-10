"use client";

import useSWR from "swr";

const API = "/api";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

const FDR_STYLE: Record<number, { bg: string; text: string }> = {
  1: { bg: "#00c85333", text: "#00c853" },
  2: { bg: "#69f0ae33", text: "#69f0ae" },
  3: { bg: "#ffd74033", text: "#ffd740" },
  4: { bg: "#ff6d0033", text: "#ff6d00" },
  5: { bg: "#d5000033", text: "#ff4444" },
};

interface Suggestion {
  id: number;
  web_name: string;
  team_short: string;
  form: number;
  fixture_score: number;
  ownership_pct: number;
  captain_score: number;
}

export default function CaptainView({
  teamId,
  gameweek,
}: {
  teamId: number;
  gameweek: number | null;
}) {
  const { data, error, isLoading } = useSWR(
    gameweek ? `${API}/decisions/captain/${teamId}/${gameweek}` : null,
    fetcher
  );

  if (!gameweek) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
        No active gameweek
      </div>
    );
  }

  if (isLoading) return <CaptainSkeleton />;
  if (error || !data?.suggestions) {
    return (
      <div className="p-8 text-center" style={{ color: "#ef4444", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
        Failed to load captain data
      </div>
    );
  }

  const suggestions: Suggestion[] = data.suggestions;
  const maxScore = Math.max(...suggestions.map((s) => s.captain_score), 1);

  return (
    <div className="p-4 flex flex-col gap-3">
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        GW{gameweek} Captain Picks — Ranked by form × fixtures × ownership
      </div>

      {suggestions.map((s, i) => {
        const fdrStyle = FDR_STYLE[Math.round(6 - s.fixture_score)] ?? FDR_STYLE[3];
        const barWidth = (s.captain_score / maxScore) * 100;

        return (
          <div
            key={s.id}
            style={{
              background: i === 0 ? "var(--primary-bg-subtle)" : "var(--card)",
              border: `1px solid ${i === 0 ? "var(--primary-border-subtle)" : "var(--border)"}`,
              borderRadius: "6px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Rank + name */}
              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: i === 0 ? "var(--primary)" : "var(--rank-dim)",
                    lineHeight: 1,
                    minWidth: "24px",
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 700,
                      fontSize: "15px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: i === 0 ? "var(--primary)" : "var(--foreground)",
                    }}
                  >
                    {s.web_name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--muted-foreground)",
                      marginTop: "1px",
                    }}
                  >
                    {s.team_short}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: i === 0 ? "var(--primary)" : "var(--foreground)",
                  lineHeight: 1,
                }}
              >
                {s.captain_score.toFixed(1)}
              </div>
            </div>

            {/* Score bar */}
            <div className="score-track">
              <div className="score-fill" style={{ width: `${barWidth}%` }} />
            </div>

            {/* Stats row */}
            <div className="flex gap-4 flex-wrap">
              <StatChip label="Form" value={s.form.toFixed(1)} />
              <StatChip
                label="Fixture"
                value={`${s.fixture_score}/5`}
                style={{ background: fdrStyle.bg, color: fdrStyle.text }}
              />
              <StatChip label="Owned" value={`${s.ownership_pct.toFixed(1)}%`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatChip({
  label,
  value,
  style,
}: {
  label: string;
  value: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        borderRadius: "4px",
        padding: "4px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "8px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: style?.color ? style.color : "var(--muted-foreground)",
          opacity: style?.color ? 0.7 : 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          fontWeight: 700,
          color: style?.color ?? "var(--foreground)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CaptainSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 96, borderRadius: 6 }} />
      ))}
    </div>
  );
}
