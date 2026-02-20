const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getKey = async (secret: string, salt: BufferSource): Promise<CryptoKey> => {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100_000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
};

const toBase64 = (bytes: Uint8Array): string => {
    if (typeof btoa === "function") {
        let binary = "";
        bytes.forEach(b => (binary += String.fromCharCode(b)));
        return btoa(binary);
    }
    return Buffer.from(bytes).toString("base64");
};

const fromBase64 = (b64: string): Uint8Array => {
    if (typeof atob === "function") {
        const binary = atob(b64);
        const out = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
        return out;
    }
    return new Uint8Array(Buffer.from(b64, "base64"));
};

export const encrypt = async (text: string, secret: string): Promise<string> => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey(secret, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(text)
    );

    const encryptedBytes = new Uint8Array(encrypted);
    const combined = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedBytes, salt.length + iv.length);

    return toBase64(combined);
};

export const decrypt = async (cipherText: string, secret: string): Promise<string> => {
    const combined = fromBase64(cipherText);

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedData = combined.slice(28);

    const key = await getKey(secret, salt);
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encryptedData
    );

    return decoder.decode(decrypted);
};
