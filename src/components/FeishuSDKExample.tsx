import { useEffect } from 'react';
import { useFeishuJSSDK } from '@/hooks/useFeishuJSSDK';
import { useFeishuDebugger } from '@/hooks/useFeishuDebugger';
import type { FeishuSDKResponse, FeishuSDKError } from '@/types/feishu';

export const FeishuSDKExample = () => {
  const { sdkReady } = useFeishuJSSDK();
  const { debuggerReady } = useFeishuDebugger();


  const handleOpenLink = () => {
    if (sdkReady) {
      window.h5sdk.openLink({
        url: 'https://example.com',
        onSuccess: function(res: FeishuSDKResponse) {
          console.log('打开链接成功', res);
        },
        onFail: function(err: FeishuSDKError) {
          console.error('打开链接失败', err);
        },
      });
    }
  };


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">飞书JSSDK示例</h1>
      <div className="space-y-4">
        <div className="space-y-2">
          <p>SDK状态: {sdkReady ? '已加载' : '加载中...'}</p>
          <p>调试工具状态: {debuggerReady ? '已加载' : '加载中...'}</p>
        </div>
        <button
          onClick={handleOpenLink}
          disabled={!sdkReady }
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          打开链接
        </button>
      </div>
    </div>
  );
}; 