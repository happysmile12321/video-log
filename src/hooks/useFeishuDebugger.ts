import { useEffect, useState } from 'react';

export const useFeishuDebugger = () => {
  const [debuggerReady, setDebuggerReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://lf-package-cn.feishucdn.com/obj/feishu-static/op/fe/devtools_frontend/remote-debug-0.0.1-alpha.6.js';
      script.async = true;
      
      script.onload = () => {
        setDebuggerReady(true);
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return { debuggerReady };
}; 