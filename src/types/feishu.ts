export interface FeishuSDKResponse {
  code: number;
  message: string;
  data?: unknown;
}

export interface FeishuSDKError {
  code: number;
  message: string;
  data?: unknown;
}

export interface FeishuLoginError {
  errCode: number;
  errMsg: string;
  errno: number;
  errString: string;
}

export interface FeishuSDKInitOptions {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
  onSuccess?: (res: FeishuSDKResponse) => void;
  onFail?: (err: FeishuSDKError) => void;
}

export interface FeishuOpenLinkOptions {
  url: string;
  onSuccess?: (res: FeishuSDKResponse) => void;
  onFail?: (err: FeishuSDKError) => void;
}

export interface RequestAuthCodeOptions {
  appId: string;
  success: (res: { code: string }) => void;
  fail: (error: FeishuLoginError) => void;
}

export interface FeishuSDK {
  init: (options: FeishuSDKInitOptions) => void;
  openLink: (options: FeishuOpenLinkOptions) => void;
}

export interface FeishuBridge {
  call: (method: string, ...args: unknown[]) => void;
}

export interface RequestAccessOptions {
  appID : string;
  scopeList: string[];
  success: (res: { code: string }) => void;
  fail: (error: FeishuLoginError) => void;
}

export interface FeishuTT {
  config: (options: unknown) => void;
  ready: (callback: () => void) => void;
  requestAuthCode: (options: RequestAuthCodeOptions) => void;
  requestAccess: (options: RequestAccessOptions) => void;
} 