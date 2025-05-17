import { useEffect, useState } from 'react';
import type { FeishuSDK, FeishuBridge, FeishuTT } from '@/types/feishu';

declare global {
  interface Window {
    h5sdk: FeishuSDK;
    __pc_bridge__: FeishuBridge;
    tt: FeishuTT;
  }
}

export const useFeishuJSSDK = (vConsoleReady: boolean) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [isFeishuEnv, setIsFeishuEnv] = useState(false);

  // 检查是否在飞书环境中
  const checkFeishuEnvironment = () => {
    if (typeof window === 'undefined') return false;
    
    // 检查是否在飞书PC客户端中
    const isPcClient = !!window.__pc_bridge__;
    // 检查是否在飞书移动端中
    const isMobileClient = !!window.tt;
    
    return isPcClient || isMobileClient;
  };

  useEffect(() => {
    if (!vConsoleReady) return;

    if (typeof window !== 'undefined') {
      // 首先检查环境
      const isFeishu = checkFeishuEnvironment();
      setIsFeishuEnv(isFeishu);

      if (!window.h5sdk) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://lf-scm-cn.feishucdn.com/lark/op/h5-js-sdk-1.5.38.js';
        script.async = true;
        
        script.onload = () => {
          setSdkReady(true);
        };

        script.onerror = (error: Event | string) => {
          console.error('Failed to load Feishu JSSDK:', error);
          setSdkReady(false);
        };

        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } else {
        setSdkReady(true);
      }
    }
  }, [vConsoleReady]);

  return { sdkReady, isFeishuEnv };
}; 