import { decrypt } from '@/shared/utils/storage/crypter';
import { createApi } from './createApi';
import { AUTH_KEYS } from '@/shared/constants/authKeys';
import { env } from '@/configs/env';

const getToken = async (): Promise<string | undefined> => {
  try {
    const enc = localStorage.getItem(AUTH_KEYS.TOKEN_KEY);
    if (!enc) return undefined;
    const raw = await decrypt(enc, AUTH_KEYS.SECRET_KEY);
    return JSON.parse(raw);
  } catch { return undefined; }
};

export default createApi(env.apiUrl, getToken);
