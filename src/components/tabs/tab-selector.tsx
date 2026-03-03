import { tabs, type TabId } from "./tab-types";

interface TabSelectorProps {
  activeTab: TabId;
  onChange: (tabId: TabId) => void;
}

export function TabSelector({ activeTab, onChange }: TabSelectorProps) {
  return (
    <view className="flex-row flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <view
            bindtap={() => {
              "background only";
              onChange(tab.id);
            }}
            className={`rounded-full border px-3 py-2 ${active ? tab.chip : "bg-white text-slate-600 border-slate-200"}`}
            key={tab.id}
          >
            <text className="text-xs font-semibold">{tab.label}</text>
          </view>
        );
      })}
    </view>
  );
}
