import { notFound } from "next/navigation";
import { getDecision } from "@/lib/decisions";
import { ExecuteView } from "./ExecuteView";

/** 6b · Approve → OTP, order placed, how money moves */
export default async function ExecutePage({ params }: PageProps<"/execute/[id]">) {
  const { id } = await params;
  const decision = getDecision(id);
  if (!decision) notFound();
  return <ExecuteView decision={decision} />;
}
