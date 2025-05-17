import { useEffect, useState } from 'react';

declare global {
  interface Window {
    h5sdk: any;
  }
}

export const useFeishuJSSDK = () => {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // 检查SDK是否已经加载
    if (typeof window !== 'undefined' && !window.h5sdk) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://lf-scm-cn.feishucdn.com/lark/op/h5-js-sdk-1.5.38.js';
      script.async = true;
      
      script.onload = () => {
        setSdkReady(true);
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else if (typeof window !== 'undefined' && window.h5sdk) {
      setSdkReady(true);
    }
  }, []);

  return { sdkReady };
}; 