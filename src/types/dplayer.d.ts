declare module 'dplayer' {
  export interface DPlayerOptions {
    container: HTMLElement;
    video: {
      url: string;
      type?: string;
      customType?: Record<string, (video: HTMLVideoElement, player: DPlayer) => void>;
    };
    subtitle?: {
      url: string;
      type?: string;
      fontSize?: string;
      bottom?: string;
      color?: string;
    };
    danmaku?: {
      id: string;
      api: string;
      token?: string;
      maximum?: number;
      addition?: string[];
      user?: string;
      bottom?: string;
      unlimited?: boolean;
    };
    autoplay?: boolean;
    theme?: string;
    loop?: boolean;
    lang?: string;
    screenshot?: boolean;
    hotkey?: boolean;
    preload?: string;
    volume?: number;
    playbackSpeed?: number[];
    logo?: string;
    video_type?: string;
    contextmenu?: Array<{
      text: string;
      link?: string;
      click?: (player: DPlayer) => void;
    }>;
    mutex?: boolean;
    pluginOptions?: Record<string, unknown>;
  }

  export interface DPlayerEvents {
    play: () => void;
    pause: () => void;
    loadstart: () => void;
    loadeddata: () => void;
    canplay: () => void;
    playing: () => void;
    ended: () => void;
    error: () => void;
    timeupdate: () => void;
  }

  export default class DPlayer {
    constructor(options: DPlayerOptions);
    on<K extends keyof DPlayerEvents>(event: K, handler: DPlayerEvents[K]): void;
    destroy(): void;
    seek(time: number): void;
    video: HTMLVideoElement;
  }
} 