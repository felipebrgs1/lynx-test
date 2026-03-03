const switches = [
  { name: "Animacoes", state: "Ligado", chip: "bg-emerald-100 text-emerald-700" },
  { name: "Compactar cards", state: "Desligado", chip: "bg-rose-100 text-rose-700" },
  { name: "Salvar filtros", state: "Ligado", chip: "bg-indigo-100 text-indigo-700" },
  { name: "Debug visual", state: "Ligado", chip: "bg-amber-100 text-amber-700" },
  { name: "Regra hover", state: "Teste", chip: "bg-sky-100 text-sky-700" },
];

export function AjustesTabView() {
  return (
    <view className="gap-4">
      <view className="rounded-2xl border border-slate-200 bg-white p-4">
        <text className="text-sm font-semibold text-slate-900">Preferencias</text>
        <view className="mt-3 gap-2">
          {switches.map((item) => (
            <view
              className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
              key={item.name}
            >
              <text className="text-sm font-medium text-slate-900">{item.name}</text>
              <text className={`rounded-full px-2 py-1 text-xs font-semibold ${item.chip}`}>
                {item.state}
              </text>
            </view>
          ))}
        </view>
      </view>

      <view className="rounded-2xl border border-slate-200 bg-white p-4">
        <text className="text-sm font-semibold text-slate-900">Pacote de teste</text>
        <text className="mt-2 text-xs leading-5 text-slate-500">
          Esta aba mistura classes de espacamento, cor, tipografia, borda, opacidade, gradiente,
          media query e pseudo-classe para ampliar cobertura do plugin.
        </text>
        <view className="mt-3 rounded-xl border border-slate-300 bg-slate-900 p-3">
          <text className="text-xs font-medium text-slate-200">fallback visual</text>
          <text className="mt-1 text-sm font-semibold text-white">
            Se alguma classe falhar, o layout principal deve permanecer estavel.
          </text>
        </view>
      </view>
    </view>
  );
}
