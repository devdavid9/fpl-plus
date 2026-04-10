"use client";

const POS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  GKP: { bg: "#f59e0b22", text: "#f59e0b", label: "GK" },
  DEF: { bg: "#10b98122", text: "#10b981", label: "DF" },
  MID: { bg: "#38bdf822", text: "#38bdf8", label: "MF" },
  FWD: { bg: "#f43f5e22", text: "#f43f5e", label: "FW" },
};

interface Player {
  id: number;
  web_name: string;
  position: string;
  team_short: string;
  now_cost: number;
  form: number;
  total_points: number;
  selected_by_percent: number;
  multiplier: number;
  is_sub: boolean;
}

function PitchMarkings() {
  return (
    <svg
      viewBox="0 0 680 900"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        color: "var(--primary)",
        pointerEvents: "none",
      }}
    >
      <g stroke="currentColor" fill="none" strokeDasharray="6 4" opacity="0.15">
        {/* Pitch outline */}
        <rect x="40" y="30" width="600" height="840" strokeWidth="1.5" />
        {/* Halfway line */}
        <line x1="40" y1="450" x2="640" y2="450" strokeWidth="1" />
        {/* Centre circle */}
        <circle cx="340" cy="450" r="70" strokeWidth="1" />
        {/* Top penalty area (behind GKP) */}
        <rect x="170" y="30" width="340" height="145" strokeWidth="1" />
        {/* Top goal area */}
        <rect x="240" y="30" width="200" height="55" strokeWidth="1" />
        {/* Bottom penalty area (in front of FWD) */}
        <rect x="170" y="725" width="340" height="145" strokeWidth="1" />
        {/* Bottom goal area */}
        <rect x="240" y="815" width="200" height="55" strokeWidth="1" />
      </g>
      {/* Centre dot */}
      <circle cx="340" cy="450" r="3" fill="currentColor" opacity="0.2" />
      {/* Penalty spots */}
      <circle cx="340" cy="140" r="2" fill="currentColor" opacity="0.15" />
      <circle cx="340" cy="760" r="2" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const col = POS_COLORS[player.position] ?? POS_COLORS.MID;
  const isCaptain = player.multiplier >= 2;
  const isTriple = player.multiplier >= 3;

  return (
    <div className="player-card" style={{ position: "relative", zIndex: 1 }}>
      <div
        className="player-badge"
        style={{
          background: col.bg,
          borderColor: col.text,
          boxShadow: `0 0 10px ${col.text}22`,
        }}
      >
        {isCaptain && <div className="captain-ring" />}
        {isCaptain && (
          <div className="captain-badge">{isTriple ? "TC" : "C"}</div>
        )}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", fontWeight: 700, color: col.text }}>
          {player.team_short}
        </span>
      </div>
      <span className="player-name-pill">{player.web_name}</span>
      <span className="player-stat">£{player.now_cost.toFixed(1)}</span>
    </div>
  );
}

function PitchRow({ players }: { players: Player[] }) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "10px",
        padding: "16px 12px",
      }}
    >
      {players.map((p) => (
        <PlayerCard key={p.id} player={p} />
      ))}
    </div>
  );
}

export default function SquadView({ squad }: { squad: Player[] }) {
  const starters = squad.filter((p) => !p.is_sub);
  const bench = squad.filter((p) => p.is_sub);

  const gkp = starters.filter((p) => p.position === "GKP");
  const def = starters.filter((p) => p.position === "DEF");
  const mid = starters.filter((p) => p.position === "MID");
  const fwd = starters.filter((p) => p.position === "FWD");

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Formation legend */}
      <div className="flex gap-3 justify-center flex-wrap">
        {Object.entries(POS_COLORS).map(([pos, col]) => (
          <div key={pos} className="flex items-center gap-1.5">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: col.text,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--muted-foreground)",
                letterSpacing: "0.1em",
              }}
            >
              {col.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--primary)",
              border: "1px solid var(--primary)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--muted-foreground)",
              letterSpacing: "0.1em",
            }}
          >
            CAP
          </span>
        </div>
      </div>

      {/* Tactical pitch — GKP top, FWD bottom */}
      <div className="tactical-pitch">
        <PitchMarkings />
        <PitchRow players={gkp} />
        <PitchRow players={def} />
        <PitchRow players={mid} />
        <PitchRow players={fwd} />
      </div>

      {/* Bench */}
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.2em",
            color: "var(--muted-foreground)",
            opacity: 0.7,
            textTransform: "uppercase",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          Substitutes
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px dashed var(--border)",
            borderRadius: "6px",
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          {bench.map((p) => (
            <div key={p.id} style={{ opacity: 0.55 }}>
              <PlayerCard player={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
