import React from 'react';
import {
  FolderOpen,
  Music,
  Type,
  Wand2,
  GitCommit,
  Smile,
  SlidersHorizontal,
} from 'lucide-react';

export type SidebarTab = 'media' | 'audio' | 'text' | 'effects' | 'transitions' | 'stickers' | 'filters';

interface SidebarNavProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: SidebarTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'media', label: 'Media', icon: FolderOpen },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'text', label: 'Teks', icon: Type },
    { id: 'effects', label: 'Efek', icon: Wand2 },
    { id: 'transitions', label: 'Transisi', icon: GitCommit },
    { id: 'stickers', label: 'Stiker', icon: Smile },
    { id: 'filters', label: 'Filter', icon: SlidersHorizontal },
  ];

  return (
    <nav className="w-16 bg-zinc-950 border-r border-zinc-800/80 flex flex-col items-center py-3 select-none z-20 shrink-0">
      <div className="flex flex-col gap-1.5 w-full px-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
