"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Stage = "idle" | "scanning" | "unlocked";

export default function TeamIdForm() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [teamId, setTeamId] = useState("");
  const [scanFill, setScanFill] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInt(teamId, 10);
    if (!parsed || parsed <= 0) return;

    setStage("scanning");
    // Double RAF: ensures browser paints scanFill=0 before transitioning to 100
    requestAnimationFrame(() => requestAnimationFrame(() => setScanFill(100)));

    setTimeout(() => setStage("unlocked"), 650);
    setTimeout(() => router.push(`/team/${parsed}`), 1100);
  }

  const isAnimating = stage !== "idle";

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="team-id"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
          }}
        >
          Your FPL Team ID
        </label>
        <input
          id="team-id"
          className="team-input"
          type="text"
          inputMode="numeric"
          placeholder="e.g. 1234567"
          required
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          disabled={isAnimating}
          style={{
            borderColor: isAnimating ? "var(--primary)" : undefined,
            boxShadow: isAnimating
              ? "0 0 0 3px var(--primary-bg-subtle), 0 0 24px var(--primary-bg-subtle)"
              : undefined,
            transition: "border-color 0.2s, box-shadow 0.3s",
          }}
        />
      </div>

      {stage === "idle" && (
        <button
          type="submit"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: "14px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "14px 32px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Unlock Team →
        </button>
      )}

      {stage === "scanning" && (
        <div className="scan-track" role="progressbar" aria-valuenow={scanFill} aria-valuemin={0} aria-valuemax={100}>
          <div className="scan-fill" style={{ width: `${scanFill}%` }} />
          <span className="scan-label">SCANNING · {teamId}</span>
        </div>
      )}

      {stage === "unlocked" && (
        <div className="unlock-granted">TEAM UNLOCKED</div>
      )}
    </form>
  );
}
