import { useEffect, useState } from 'react';
import type { FeishuSDKError } from '@/types/feishu';

interface LoginResponse {
  code: string;
}

export const useFeishuLogin = (sdkReady: boolean) => {
  const [userCode, setUserCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sdkReady) return;

    // 获取URL中的code参数
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setUserCode(code);
      return;
    }

    // 如果没有code，调用requestAuthCode
    window.tt?.requestAuthCode({
      appId: 'cli_a8a291fcee78d00c', // 替换为你的应用 ID
      success: (res: LoginResponse) => {
        setUserCode(res.code);
      },
      fail: (err: FeishuSDKError) => {
        setError(err.message);
        console.error('登录失败:', err);
      },
    });
  }, [sdkReady]);

  return { userCode, error };
}; 