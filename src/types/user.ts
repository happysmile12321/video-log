export interface FeishuUserInfo {
  union_id: string;
  avatar_big: string;
  avatar_middle: string;
  avatar_url: string;
  avatar_thumb: string;
  en_name: string;
  name: string;
  tenant_key: string;
  email: string;
  mobile: string;
  open_id: string;
}

export interface FeishuUserResponse {
  msg: string;
  code: number;
  data: FeishuUserInfo;
} 