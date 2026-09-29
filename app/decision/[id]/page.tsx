import { notFound } from "next/navigation";
import { getDecision } from "@/lib/decisions";
import { DecisionView } from "./DecisionView";

/** 6 · Decision to approve */
export default async function DecisionPage({ params }: PageProps<"/decision/[id]">) {
  const { id } = await params;
  const decision = getDecision(id);
  if (!decision) notFound();
  return <DecisionView decision={decision} />;
}
