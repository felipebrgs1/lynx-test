import { useEffect } from "@lynx-js/react";

import "./App.css";

const shortcuts = [
  { label: "Receitas", value: "+ R$ 4.800", tone: "text-emerald-600" },
  { label: "Despesas", value: "- R$ 2.175", tone: "text-rose-600" },
  { label: "Investido", value: "R$ 1.960", tone: "text-sky-600" },
  { label: "Reserva", value: "R$ 7.120", tone: "text-violet-600" },
];

const recentActivity = [
  { title: "Mercado Central", when: "Hoje, 09:32", amount: "- R$ 93,20" },
  { title: "Pix recebido", when: "Hoje, 08:15", amount: "+ R$ 450,00" },
  { title: "Assinatura Musica", when: "Ontem, 22:10", amount: "- R$ 19,90" },
  { title: "Farmacia", when: "Ontem, 20:55", amount: "- R$ 48,70" },
  { title: "Freelance", when: "Ontem, 15:21", amount: "+ R$ 780,00" },
  { title: "Restaurante", when: "Ontem, 12:43", amount: "- R$ 72,30" },
];

const goals = [
  { name: "Viagem", progress: "68%", value: "R$ 3.400 / R$ 5.000" },
  { name: "Notebook", progress: "40%", value: "R$ 2.000 / R$ 5.000" },
  { name: "Curso", progress: "85%", value: "R$ 1.700 / R$ 2.000" },
  { name: "Reserva", progress: "52%", value: "R$ 5.200 / R$ 10.000" },
];

const months = [
  { month: "Jan", value: "R$ 2.120" },
  { month: "Fev", value: "R$ 1.980" },
  { month: "Mar", value: "R$ 2.440" },
  { month: "Abr", value: "R$ 2.070" },
  { month: "Mai", value: "R$ 2.360" },
  { month: "Jun", value: "R$ 2.510" },
];

const feed = Array.from({ length: 48 }, (_, index) => {
  const item = recentActivity[index % recentActivity.length];

  return {
    ...item,
    id: `${item.title}-${index}`,
  };
});

export function App(props: { onRender?: () => void }) {
  useEffect(() => {
    console.info("Lynx Tailwind test view");
  }, []);

  props.onRender?.();

  return (
    <view className="bg-slate-100 p-4">
      <scroll-view scroll-y className="h-[680px] rounded-2xl border border-slate-200 bg-slate-100 p-4">
        <view className="gap-4 pb-10">
          <view className="rounded-2xl border border-slate-200 bg-white p-4">
            <text className="text-xs font-medium text-slate-500">app de teste</text>
            <text className="mt-1 text-2xl font-semibold text-slate-900">Carteira Lynx</text>
            <text className="mt-1 text-sm text-slate-500">
              Layout base com Tailwind v4 para validar o plugin.
            </text>
            <view className="mt-4 rounded-xl bg-slate-900 p-4">
              <text className="text-xs text-slate-300">Saldo atual</text>
              <text className="mt-1 text-3xl font-semibold text-white">R$ 12.430,85</text>
            </view>
          </view>

          <view className="flex-row flex-wrap gap-3">
            {shortcuts.map((item) => (
              <view className="w-[48%] rounded-xl border border-slate-200 bg-white p-3" key={item.label}>
                <text className="text-xs text-slate-500">{item.label}</text>
                <text className={`mt-1 text-base font-semibold ${item.tone}`}>{item.value}</text>
              </view>
            ))}
          </view>

          <view className="rounded-2xl border border-slate-200 bg-white p-4">
            <text className="text-sm font-semibold text-slate-900">Resumo mensal</text>
            <view className="mt-3 gap-2">
              {months.map((item) => (
                <view className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={item.month}>
                  <view className="flex-row justify-between">
                    <text className="text-sm font-medium text-slate-900">{item.month}</text>
                    <text className="text-sm font-semibold text-slate-800">{item.value}</text>
                  </view>
                </view>
              ))}
            </view>
          </view>

          <view className="rounded-2xl border border-slate-200 bg-white p-4">
            <text className="text-sm font-semibold text-slate-900">Metas</text>
            <view className="mt-3 gap-2">
              {goals.map((goal) => (
                <view className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={goal.name}>
                  <view className="flex-row justify-between">
                    <text className="text-sm font-medium text-slate-900">{goal.name}</text>
                    <text className="text-xs font-semibold text-slate-500">{goal.progress}</text>
                  </view>
                  <text className="mt-1 text-xs text-slate-500">{goal.value}</text>
                </view>
              ))}
            </view>
          </view>

          <view className="rounded-2xl border border-slate-200 bg-white p-4">
            <text className="text-sm font-semibold text-slate-900">Atividade recente</text>
            <view className="mt-3 gap-2">
              {feed.map((item) => (
                <view className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={item.id}>
                  <text className="text-sm font-medium text-slate-900">{item.title}</text>
                  <view className="mt-1 flex-row justify-between">
                    <text className="text-xs text-slate-500">{item.when}</text>
                    <text className="text-sm font-semibold text-slate-800">{item.amount}</text>
                  </view>
                </view>
              ))}
            </view>
          </view>

          <view className="rounded-xl bg-slate-900 p-3">
            <text className="text-center text-sm font-medium text-white">
              Adicionar nova transacao
            </text>
          </view>
        </view>
      </scroll-view>
    </view>
  );
}
