import { useEffect } from 'react';
import type { FeishuSDKError } from '@/types/feishu';

export const useFeishuAutoLogin = (sdkReady: boolean) => {
    useEffect(() => {
        if (!sdkReady) return;
        //调用requestauthcode
        callRequestAuthCode();
    }, [sdkReady]);
};

function callRequestAuthCode() {
    window.tt.requestAuthCode({
        appId: 'cli_a8a291fcee78d00c',
        success: (res: { code: string }) => {
            console.log(res);
        },
        fail: (error: FeishuSDKError) => {
            console.error(error);
        },
    });
}