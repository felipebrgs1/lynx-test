const bars = [
  { label: "Moradia", value: "R$ 1.420", width: "w-[88%] bg-indigo-500" },
  { label: "Alimentacao", value: "R$ 980", width: "w-[62%] bg-emerald-500" },
  { label: "Transporte", value: "R$ 410", width: "w-[36%] bg-amber-500" },
  { label: "Lazer", value: "R$ 590", width: "w-[44%] bg-rose-500" },
  { label: "Saude", value: "R$ 260", width: "w-[28%] bg-sky-500" },
  { label: "Cursos", value: "R$ 390", width: "w-[31%] bg-violet-500" },
];

export function AnalisesTabView() {
  return (
    <view className="gap-4">
      <view className="rounded-2xl border border-slate-200 bg-white p-4">
        <text className="text-sm font-semibold text-slate-900">Distribuicao por grupo</text>
        <view className="mt-3 gap-3">
          {bars.map((bar) => (
            <view key={bar.label}>
              <view className="mb-1 flex-row justify-between">
                <text className="text-xs font-medium text-slate-700">{bar.label}</text>
                <text className="text-xs text-slate-500">{bar.value}</text>
              </view>
              <view className="h-2 overflow-hidden rounded-full bg-slate-200">
                <view className={`h-2 rounded-full ${bar.width}`} />
              </view>
            </view>
          ))}
        </view>
      </view>

      <view className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
        <text className="text-sm font-semibold text-slate-900">Stress de utilitarios</text>
        <view className="mt-3 flex-row flex-wrap gap-2">
          <text className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 underline">
            underline
          </text>
          <text className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 line-through">
            line-through
          </text>
          <text className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium uppercase text-slate-700">
            uppercase
          </text>
          <text className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium italic text-slate-700">
            italic
          </text>
          <text className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200">
            hover:bg-slate-200
          </text>
          <text className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 active:opacity-70">
            active:opacity-70
          </text>
          <text className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 md:text-xs">
            md:text-xs
          </text>
        </view>
      </view>
    </view>
  );
}
