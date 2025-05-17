import { useEffect, useState } from 'react';
import type { FeishuLoginError } from '@/types/feishu';
import type { FeishuUserResponse } from '@/types/user';
import { useUser } from '@/contexts/UserContext';

interface LoginResponse {
  code: string;
}

const STORAGE_KEY = 'feishu_user_info';

export const useFeishuLogin = (sdkReady: boolean, vConsoleReady: boolean) => {
  const [userCode, setUserCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setUserInfo, userInfo } = useUser();

  // 获取用户信息
  const fetchUserInfo = async (code: string) => {
    try {
      const response = await fetch('https://open.feishu.cn/anycross/trigger/callback/MDcxNmQzMzAxYjQxYTQzMGI3OWQyNTkwN2VmNDUwZGQ2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FeishuUserResponse = await response.json();
      
      if (data.code === 0) {
        // 保存用户信息到 sessionStorage
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        setUserInfo(data.data);
      } else {
        setError(data.msg || '获取用户信息失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
      setError(errorMessage);
      console.error('获取用户信息失败:', err);
    }
  };

  useEffect(() => {
    if (!sdkReady || !vConsoleReady) return;

    // 检查 sessionStorage 中是否已有用户信息
    const storedUserInfo = sessionStorage.getItem(STORAGE_KEY);
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
        return; // 如果已有用户信息，直接返回，不再请求登录
      } catch (err) {
        console.error('解析存储的用户信息失败:', err);
        sessionStorage.removeItem(STORAGE_KEY); // 清除无效的数据
      }
    }

    // 如果已经有 userCode 且没有用户信息，则获取用户信息
    if (userCode && !userInfo) {
      fetchUserInfo(userCode);
      return;
    }

    // 如果没有code且没有用户信息，调用requestAccess
    if (!userInfo) {
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
    }
  }, [sdkReady, vConsoleReady, setUserInfo, userCode, userInfo]);

  return { userCode, error };
}; 