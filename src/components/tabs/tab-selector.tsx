import { tabs, type TabId } from "./tab-types";

interface TabSelectorProps {
  activeTab: TabId;
  onChange: (tabId: TabId) => void;
}

export function TabSelector({ activeTab, onChange }: TabSelectorProps) {
  return (
    <view className="rounded-2xl border border-slate-200 bg-white px-2 pt-2">
      <view className="flex flex-row items-end">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <view
              bindtap={() => {
                "background only";
                onChange(tab.id);
              }}
              className="flex flex-1 flex-col items-center px-2 pb-2 pt-1"
              key={tab.id}
            >
              <text
                className={`text-xs font-semibold ${active ? tab.activeText : "text-slate-500"}`}
              >
                {tab.label}
              </text>
              <view
                className={`mt-2 h-1 w-full rounded-full ${active ? tab.activeIndicator : "bg-slate-200"}`}
              />
            </view>
          );
        })}
      </view>
    </view>
  );
}
