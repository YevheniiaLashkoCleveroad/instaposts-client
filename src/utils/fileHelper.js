const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export const toAbsolute = (u) => {
    try {
        return new URL(u, base).toString();
    } catch {
        return u;
    }
};

export function isVideoFile(x) {
    if (!x) return false;

    const type = (x.mimeType || "").toLowerCase();
    if (type.startsWith("video/")) return true;

    const nameish = String(x.name || x.filename || x.url || x).toLowerCase();
    return /\.(mp4|webm|ogv|ogg|mov|m4v)$/i.test(nameish);
}
