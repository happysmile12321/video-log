import { useEffect, useState } from 'react';
import type { FeishuSDK, FeishuBridge, FeishuTT } from '@/types/feishu';

declare global {
  interface Window {
    h5sdk: FeishuSDK;
    __pc_bridge__: FeishuBridge;
    tt: FeishuTT;
  }
}

export const useFeishuJSSDK = () => {
  const [sdkReady, setSdkReady] = useState(false);
  const [isFeishuEnv] = useState(true);
 

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.26.js';
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
  }, []);

  return { sdkReady, isFeishuEnv };
}; 