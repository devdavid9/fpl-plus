import type { Metadata } from "next";
import TeamDashboard from "@/components/team-dashboard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Team ${id} — FPL Unlocked` };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeamDashboard teamId={parseInt(id)} />;
}
