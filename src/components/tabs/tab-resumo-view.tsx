const quickStats = [
  { title: "Entrada", value: "+ R$ 7.450", tone: "text-emerald-600" },
  { title: "Saida", value: "- R$ 3.240", tone: "text-rose-600" },
  { title: "Meta", value: "73%", tone: "text-indigo-600" },
  { title: "Risco", value: "Baixo", tone: "text-sky-600" },
];

const movementBase = [
  { title: "Mercado", when: "Hoje 09:32", amount: "- R$ 93,20" },
  { title: "Pix recebido", when: "Hoje 08:15", amount: "+ R$ 450,00" },
  { title: "Farmacia", when: "Ontem 20:55", amount: "- R$ 48,70" },
  { title: "Freelance", when: "Ontem 15:21", amount: "+ R$ 780,00" },
  { title: "Restaurante", when: "Ontem 12:43", amount: "- R$ 72,30" },
];

const movementFeed = Array.from({ length: 40 }, (_, index) => {
  const row = movementBase[index % movementBase.length];

  return {
    ...row,
    id: `${row.title}-${index}`,
  };
});

export function ResumoTabView() {
  return (
    <view className="gap-4">
      <view className="flex-row flex-wrap gap-3">
        {quickStats.map((item) => (
          <view
            className="w-[48%] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            key={item.title}
          >
            <text className="text-xs text-slate-500">{item.title}</text>
            <text className={`mt-1 text-base font-semibold ${item.tone}`}>{item.value}</text>
          </view>
        ))}
      </view>

      <view className="rounded-2xl border border-slate-200 bg-white p-4">
        <text className="text-sm font-semibold text-slate-900">Movimentacoes recentes</text>
        <view className="mt-3 gap-2">
          {movementFeed.slice(0, 20).map((item) => (
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
    </view>
  );
}
