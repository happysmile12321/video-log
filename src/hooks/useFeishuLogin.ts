import { useEffect, useState } from 'react';
import type { FeishuLoginError } from '@/types/feishu';

interface LoginResponse {
  code: string;
}

export const useFeishuLogin = (sdkReady: boolean, vConsoleReady: boolean) => {
  const [userCode, setUserCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sdkReady || !vConsoleReady) return;

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
      fail: (err: FeishuLoginError) => {
        // 处理重定向URL未配置的错误
        if (err.errno === 2602002 || err.errCode === 2602002) {
          const redirectUrl = window.location.origin;
          setError(`请在飞书开放平台配置以下重定向URL：${redirectUrl}`);
          console.error('登录失败: 需要配置重定向URL', {
            error: err,
            requiredRedirectUrl: redirectUrl
          });
        } else {
          setError(err.errMsg || err.errString || '登录失败');
          console.error('登录失败:', err);
        }
      },
    });
  }, [sdkReady, vConsoleReady]);

  return { userCode, error };
}; 