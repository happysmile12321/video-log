import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-none bg-gray-800/50 p-1 rounded-lg">
      <div className="flex space-x-1 min-w-full sm:min-w-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0",
              "hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-700",
              activeTab === tab.id
                ? "bg-gray-700 text-white"
                : "text-gray-400"
            )}
          >
            {tab.icon && (
              <span className="mr-1.5 sm:mr-2">
                {tab.icon}
              </span>
            )}
            <span className="truncate">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 