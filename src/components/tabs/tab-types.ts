export type TabId = "resumo" | "movimentos" | "analises" | "ajustes";

export interface TabDefinition {
  id: TabId;
  label: string;
  chip: string;
}

export const tabs: TabDefinition[] = [
  { id: "resumo", label: "Resumo", chip: "bg-slate-900 text-white border-slate-900" },
  {
    id: "movimentos",
    label: "Movimentos",
    chip: "bg-indigo-600 text-white border-indigo-600",
  },
  {
    id: "analises",
    label: "Analises",
    chip: "bg-emerald-600 text-white border-emerald-600",
  },
  {
    id: "ajustes",
    label: "Ajustes",
    chip: "bg-amber-500 text-slate-900 border-amber-500",
  },
];
