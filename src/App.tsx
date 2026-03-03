import { useEffect, useState } from "@lynx-js/react";

import {
  AjustesTabView,
  AnalisesTabView,
  MovimentosTabView,
  ResumoTabView,
  TabSelector,
  type TabId,
} from "./components/tabs/index";
import "./App.css";

function renderActiveTab(activeTab: TabId) {
  if (activeTab === "resumo") {
    return <ResumoTabView />;
  }

  if (activeTab === "movimentos") {
    return <MovimentosTabView />;
  }

  if (activeTab === "analises") {
    return <AnalisesTabView />;
  }

  return <AjustesTabView />;
}

export function App(props: { onRender?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("resumo");

  useEffect(() => {
    console.info("Lynx Tailwind tabs stress view");
  }, []);

  props.onRender?.();

  return (
    <view className="bg-slate-100 p-4">
      <scroll-view scroll-y className="h-[760px] rounded-3xl border border-slate-200 bg-slate-100 p-4">
        <view className="gap-4 pb-14">
          <view className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80">
            <view className="flex-row items-start justify-between gap-2">
              <view className="flex-1">
                <text className="text-xs font-medium text-slate-500">tailwind stress lab</text>
                <text className="mt-1 text-2xl font-semibold text-slate-900">Teste Tailwind Lynx</text>
                <text className="mt-1 text-sm leading-5 text-slate-500">
                  Cada aba usa classes diferentes para exercitar o pipeline de sanitizacao.
                </text>
              </view>
              <view className="self-start rounded-full border border-slate-300 bg-slate-100 px-2 py-1">
                <text className="text-[11px] font-semibold text-slate-600">v4</text>
              </view>
            </view>

            <view className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <text className="text-xs text-slate-300">Saldo consolidado</text>
              <text className="mt-1 text-3xl font-semibold tracking-tight text-white">R$ 12.430,85</text>
              <view className="mt-3 flex-row items-center gap-2">
                <view className="rounded-full bg-emerald-500/20 px-2 py-1">
                  <text className="text-xs font-semibold text-emerald-400">+12.8% no mes</text>
                </view>
                <view className="rounded-full bg-indigo-500/20 px-2 py-1">
                  <text className="text-xs font-semibold text-indigo-300">objetivo 2026</text>
                </view>
              </view>
            </view>
          </view>

          <TabSelector activeTab={activeTab} onChange={setActiveTab} />

          {renderActiveTab(activeTab)}

          <view className="rounded-xl bg-slate-900 p-3">
            <text className="text-center text-sm font-medium text-white">Executar proximo teste</text>
          </view>
        </view>
      </scroll-view>
    </view>
  );
}
