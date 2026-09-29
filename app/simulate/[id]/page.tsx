import { notFound } from "next/navigation";
import { CarSimulation } from "./CarSimulation";
import { SimpleSimulation } from "./SimpleSimulation";

const simple = new Set(["house-2029", "retire-55", "raise-30", "job-loss"]);

/** 16 · Simulation */
export default async function SimulatePage({ params }: PageProps<"/simulate/[id]">) {
  const { id } = await params;
  if (id === "car") return <CarSimulation />;
  if (simple.has(id)) return <SimpleSimulation id={id as "house-2029" | "retire-55" | "raise-30" | "job-loss"} />;
  notFound();
}
