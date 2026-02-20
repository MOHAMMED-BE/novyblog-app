import { env } from "@/configs/env";
import { useEffect, useState } from "react";
import { decrypt, encrypt } from "shared/utils/storage/crypter";

const SECRET_KEY = env.SECRET_KEY;

export const useLocalStorage = <T>(keyName: string, defaultValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const localValue = localStorage.getItem(keyName);
        const encrypted = localValue;

        if (encrypted) {
          const decrypted = await decrypt(encrypted, SECRET_KEY);
          setStoredValue(JSON.parse(decrypted));
        } else {
          const encryptedDefault = await encrypt(JSON.stringify(defaultValue), SECRET_KEY);
          localStorage.setItem(keyName, encryptedDefault);
          setStoredValue(defaultValue);
        }
      } catch (err) {
        setStoredValue(defaultValue);
      } finally {
        setInitialized(true);
      }
    };

    loadValue();
  }, [keyName]);

  const setValue = async (value: T | ((prev: T) => T), rememberMe = true) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      const encrypted = await encrypt(JSON.stringify(valueToStore), SECRET_KEY);
      if (rememberMe) {
        localStorage.setItem(keyName, encrypted);
      } else {
        localStorage.removeItem(keyName);
      }

      setStoredValue(valueToStore);
    } catch (err) {
      // console.error("Error setting encrypted data:", err);
    }
  };

  return [storedValue, setValue, initialized] as const;
};
