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
    contextmenu?: Array<{
      text: string;
      link?: string;
      click?: (player: DPlayer) => void;
    }>;
    highlight?: Array<{
      time: number;
      text: string;
    }>;
  }

  export default class DPlayer {
    constructor(options: DPlayerOptions);
    play(): void;
    pause(): void;
    seek(time: number): void;
    toggle(): void;
    on(event: string, handler: (...args: any[]) => void): void;
    destroy(): void;
    volume(percentage: number, nonotice: boolean): void;
    video: HTMLVideoElement;
    danmaku: any;
    fullScreen: {
      request: (type?: string) => void;
      cancel: (type?: string) => void;
    };
  }
} 