const categoryTags = [
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-sky-50 text-sky-700 border-sky-200",
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-slate-100 text-slate-700 border-slate-300",
  "bg-zinc-100 text-zinc-700 border-zinc-300",
];

const cards = [
  {
    name: "Cartao Black",
    number: "**** 9281",
    gradient: "bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800",
    ring: "ring-slate-300",
  },
  {
    name: "Cartao Travel",
    number: "**** 1142",
    gradient: "bg-gradient-to-r from-indigo-700 via-indigo-500 to-sky-500",
    ring: "ring-indigo-200",
  },
  {
    name: "Cartao Day",
    number: "**** 4410",
    gradient: "bg-gradient-to-r from-emerald-700 via-emerald-500 to-lime-500",
    ring: "ring-emerald-200",
  },
  {
    name: "Cartao Flex",
    number: "**** 7773",
    gradient: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500",
    ring: "ring-amber-200",
  },
];

export function MovimentosTabView() {
  return (
    <view className="gap-4">
      <view className="rounded-2xl border border-slate-200 bg-white p-4">
        <text className="text-sm font-semibold text-slate-900">Categorias</text>
        <view className="mt-3 flex-row flex-wrap gap-2">
          {categoryTags.map((tag, index) => (
            <view className={`rounded-full border px-3 py-1 ${tag}`} key={`${tag}-${index}`}>
              <text className="text-xs font-medium">Classe {index + 1}</text>
            </view>
          ))}
        </view>
      </view>

      <view className="gap-3">
        {cards.map((card) => (
          <view
            className={`overflow-hidden rounded-3xl border border-white/40 p-4 text-white ring-1 ${card.gradient} ${card.ring}`}
            key={card.name}
          >
            <view className="flex-row items-center justify-between">
              <text className="text-sm font-semibold text-white">{card.name}</text>
              <text className="text-xs italic text-white/80">ativo</text>
            </view>
            <text className="mt-6 text-xl font-semibold tracking-[2px] text-white">{card.number}</text>
            <view className="mt-4 flex-row items-center justify-between">
              <text className="text-xs text-white/80">limite R$ 8.500</text>
              <text className="rounded-full bg-white/20 px-2 py-1 text-[11px] font-semibold text-white">
                virtual
              </text>
            </view>
          </view>
        ))}
      </view>
    </view>
  );
}
