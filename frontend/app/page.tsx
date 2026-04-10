import TeamIdForm from "@/components/team-id-form";
import ThemeToggle from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="landing-bg relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
      <ThemeToggle />
      <div className="grid-lines" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center leading-none gap-0">
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(64px, 12vw, 96px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--foreground)",
                lineHeight: 1,
              }}
            >
              FPL
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(36px, 7.5vw, 56px)",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "var(--primary)",
                lineHeight: 1,
              }}
            >
              UNLOCKED
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
            }}
          >
            Fantasy Premier League Intelligence
          </p>
        </div>

        <div
          style={{
            width: "100%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, var(--divider-color), transparent)",
          }}
        />

        <TeamIdForm />

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--muted-foreground)",
            opacity: 0.6,
            letterSpacing: "0.05em",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          Find your ID at fantasy.premierleague.com
          <br />
          Points → My Team → the number in the URL
        </p>
      </div>
    </div>
  );
}
