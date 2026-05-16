import { createFileRoute } from "@tanstack/react-router";
import AsimocIndex from "@/components/AsimocIndex";

export const Route = createFileRoute("/")({
  component: AsimocIndex,
});
