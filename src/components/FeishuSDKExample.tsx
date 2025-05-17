import { useFeishuJSSDK } from '@/hooks/useFeishuJSSDK';
import { useFeishuDebugger } from '@/hooks/useFeishuDebugger';
import { useVConsole } from '@/hooks/useVConsole';
import type { FeishuSDKResponse, FeishuSDKError } from '@/types/feishu';

export const FeishuSDKExample = () => {
  const { sdkReady, isFeishuEnv } = useFeishuJSSDK();
  const { debuggerReady } = useFeishuDebugger();
  const { vConsoleReady } = useVConsole();


  const handleOpenLink = () => {
    if (sdkReady && isFeishuEnv && window.h5sdk) {
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

  if (!isFeishuEnv) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">注意</p>
          <p>此页面需要在飞书客户端内打开才能使用完整功能。</p>
          <p className="mt-2 text-sm">
            请使用飞书扫描二维码或在飞书中打开此页面。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">飞书JSSDK示例</h1>
      <div className="space-y-4">
        <div className="space-y-2">
          <p>SDK状态: {sdkReady ? '已加载' : '加载中...'}</p>
          <p>调试工具状态: {debuggerReady ? '已加载' : '加载中...'}</p>
          <p>运行环境: {isFeishuEnv ? '飞书客户端' : '非飞书环境'}</p>
          <p>VConsole状态: {vConsoleReady ? '已加载' : '加载中...'}</p>
        </div>
        <button
          onClick={handleOpenLink}
          disabled={!sdkReady || !isFeishuEnv}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          打开链接
        </button>
      </div>
    </div>
  );
}; 