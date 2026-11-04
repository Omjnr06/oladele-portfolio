import { redirect } from "next/navigation";
import { getFeed } from "./lib/feed";
import { isOwner } from "./lib/auth";
import { parseParams } from "./lib/filters";
import GrindBoard from "./components/GrindBoard";

export const metadata = {
  title: "Grind — Open Roles | Oladele Magbadelo",
  description: "Live board of internship and new-grad roles across the US, Canada and the UK, refreshed every 15 minutes.",
};

export default async function GrindPage({ searchParams }) {
  const sp = await searchParams;
  if (sp.key) redirect(`/api/grind/unlock?${new URLSearchParams(sp).toString()}`);
  const [feed, owner] = await Promise.all([getFeed(), isOwner()]);
  return <GrindBoard feed={feed} owner={owner} initial={parseParams(sp)} unlockStatus={["failed", "unconfigured"].includes(sp.unlock) ? sp.unlock : null} />;
}
