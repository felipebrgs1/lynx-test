export type TabId = "resumo" | "movimentos" | "analises" | "ajustes";

export interface TabDefinition {
  id: TabId;
  label: string;
  activeText: string;
  activeIndicator: string;
}

export const tabs: TabDefinition[] = [
  {
    id: "resumo",
    label: "Resumo",
    activeText: "text-slate-900",
    activeIndicator: "bg-slate-900",
  },
  {
    id: "movimentos",
    label: "Movimentos",
    activeText: "text-indigo-600",
    activeIndicator: "bg-indigo-600",
  },
  {
    id: "analises",
    label: "Analises",
    activeText: "text-emerald-600",
    activeIndicator: "bg-emerald-600",
  },
  {
    id: "ajustes",
    label: "Ajustes",
    activeText: "text-amber-600",
    activeIndicator: "bg-amber-500",
  },
];
