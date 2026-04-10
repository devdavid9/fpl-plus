"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import SquadView from "./squad-view";
import CaptainView from "./captain-view";
import FixturesView from "./fixtures-view";
import TransfersView from "./transfers-view";
import ThemeToggle from "./theme-toggle";

const API = "/api";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = "squad" | "captain" | "fixtures" | "transfers";

const TABS: { id: Tab; label: string }[] = [
  { id: "squad", label: "Squad" },
  { id: "captain", label: "Captain" },
  { id: "fixtures", label: "Fixtures" },
  { id: "transfers", label: "Transfers" },
];

export default function TeamDashboard({ teamId }: { teamId: number }) {
  const [activeTab, setActiveTab] = useState<Tab>("squad");

  const { data, error, isLoading } = useSWR(
    `${API}/team/${teamId}`,
    fetcher
  );

  if (isLoading) return <DashboardSkeleton />;

  if (error || data?.detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "48px",
            fontWeight: 800,
            color: "#ef4444",
            letterSpacing: "0.04em",
          }}
        >
          Not Found
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--muted-foreground)",
            letterSpacing: "0.1em",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Team ID {teamId} could not be loaded
          <br />
          Check the ID and try again
        </p>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--primary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
            marginTop: "8px",
          }}
        >
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ThemeToggle />

      {/* Header */}
      <header className="dash-header px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--muted-foreground)",
                  textDecoration: "none",
                  letterSpacing: "0.1em",
                }}
              >
                ← FPL Unlocked
              </Link>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(22px, 5vw, 32px)",
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--foreground)",
                lineHeight: 1.1,
                marginTop: "4px",
              }}
            >
              {data.name}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--muted-foreground)",
                letterSpacing: "0.06em",
                marginTop: "2px",
              }}
            >
              {data.manager}
            </p>
          </div>

          {/* Stats chips */}
          <div className="flex gap-3 flex-wrap">
            <StatChip label="Points" value={data.overall_points?.toLocaleString() ?? "—"} accent />
            <StatChip label="Rank" value={data.overall_rank ? `#${data.overall_rank.toLocaleString()}` : "—"} />
            {data.gameweek && (
              <StatChip label="GW" value={`GW${data.gameweek}`} />
            )}
          </div>
        </div>
      </header>

      {/* Tab bar + Content */}
      <div className="dash-body">
        <div className="tab-bar">
          <div className="max-w-4xl mx-auto w-full flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-item${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 max-w-4xl mx-auto w-full">
          {activeTab === "squad" && data.squad && (
            <SquadView squad={data.squad} />
          )}
          {activeTab === "captain" && (
            <CaptainView teamId={teamId} gameweek={data.gameweek} />
          )}
          {activeTab === "fixtures" && (
            <FixturesView teamId={teamId} />
          )}
          {activeTab === "transfers" && (
            <TransfersView teamId={teamId} />
          )}
        </main>
      </div>
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: accent ? "var(--primary-bg-subtle)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${accent ? "var(--primary-border-subtle)" : "var(--border)"}`,
        borderRadius: "4px",
        padding: "8px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "64px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "8px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: accent ? "var(--primary)" : "var(--muted-foreground)",
          opacity: accent ? 0.6 : 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "16px",
          fontWeight: 700,
          color: accent ? "var(--primary)" : "var(--foreground)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="dash-header px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <div className="skeleton" style={{ width: 40, height: 12 }} />
            <div className="skeleton" style={{ width: 220, height: 30 }} />
            <div className="skeleton" style={{ width: 120, height: 14 }} />
          </div>
          <div className="flex gap-3">
            {[80, 90, 60].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: w, height: 52, borderRadius: 4 }} />
            ))}
          </div>
        </div>
      </header>
      <div className="dash-body">
        <div className="tab-bar">
          <div className="max-w-4xl mx-auto w-full flex gap-0">
            {TABS.map((t) => (
              <div
                key={t.id}
                className="tab-item"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 70, borderRadius: 6 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
