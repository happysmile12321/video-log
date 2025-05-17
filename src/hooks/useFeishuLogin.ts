import { useEffect, useState } from 'react';
import type { FeishuLoginError } from '@/types/feishu';
import type { FeishuUserResponse } from '@/types/user';
import { useUser } from '@/contexts/UserContext';

interface LoginResponse {
  code: string;
}

export const useFeishuLogin = (sdkReady: boolean, vConsoleReady: boolean) => {
  const [userCode, setUserCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setUserInfo } = useUser();

  // 获取用户信息
  const fetchUserInfo = async (code: string) => {
    try {
      const response = await fetch('https://open.feishu.cn/anycross/trigger/callback/MDcxNmQzMzAxYjQxYTQzMGI3OWQyNTkwN2VmNDUwZGQ2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data: FeishuUserResponse = await response.json();
      
      if (data.code === 0) {
        setUserInfo(data.data);
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError('获取用户信息失败');
      console.error('获取用户信息失败:', err);
    }
  };

  useEffect(() => {
    if (!sdkReady || !vConsoleReady) return;

    // 获取URL中的code参数
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setUserCode(code);
      fetchUserInfo(code);
      return;
    }

    // 如果没有code，调用requestAccess
    window.tt?.requestAccess({
      scopeList: ["offline_access"],
      appID: 'cli_a8a291fcee78d00c', // 替换为你的应用 ID
      success: (res: LoginResponse) => {
        setUserCode(res.code);
        fetchUserInfo(res.code);
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
  }, [sdkReady, vConsoleReady, setUserInfo]);

  return { userCode, error };
}; 