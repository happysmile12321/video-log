export interface VConsoleOptions {
  theme?: 'light' | 'dark';
  target?: string | HTMLElement;
  defaultPlugins?: string[];
  maxLogNumber?: number;
  disableLogScrolling?: boolean;
  onReady?: () => void;
  onClearLog?: () => void;
}

export interface VConsoleInstance {
  destroy: () => void;
  show: () => void;
  hide: () => void;
  showTab: (pluginId: string) => void;
  hideTab: (pluginId: string) => void;
}

export interface VConsoleConstructor {
  new (options?: VConsoleOptions): VConsoleInstance;
} 