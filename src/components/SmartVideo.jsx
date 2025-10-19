import { useEffect, useRef, useState } from "react";

export default function SmartVideo({
                                       src,
                                       className = "",
                                       auto = true,
                                       controls = false,
                                       loop = true,
                                       muted = true,
                                       poster = "",
                                       fit = "cover",
                                       preload = "metadata",
                                       lazy = true,
                                   }) {
    const containerRef = useRef(null);
    const videoRef = useRef(null);

    const [activated, setActivated] = useState(!lazy);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState("");
    const lastKickRef = useRef(0);

    useEffect(() => {
        if (!lazy) return;
        const node = containerRef.current;
        if (!node) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setActivated(true);
                    io.disconnect();
                }
            },
            { root: null, rootMargin: "200px 0px", threshold: 0.01 }
        );

        io.observe(node);
        return () => io.disconnect();
    }, [lazy]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        const onLoadedData = async () => {
            setReady(true);
            try { if (v.currentTime < 0.01) v.currentTime = 0.01; } catch {}
            if (auto) { try { await v.play(); } catch {} }
        };

        const onError = () => setError(v.error?.message || "Playback error");

        const onStalled = async () => {
            const now = Date.now();
            if (now - lastKickRef.current < 10_000) return;
            lastKickRef.current = now;
            try {
                v.pause();
                v.load();
                if (auto) { try { await v.play(); } catch {} }
            } catch {}
        };

        v.addEventListener("loadeddata", onLoadedData);
        v.addEventListener("canplay", onLoadedData);
        v.addEventListener("stalled", onStalled);
        v.addEventListener("error", onError);
        return () => {
            v.removeEventListener("loadeddata", onLoadedData);
            v.removeEventListener("canplay", onLoadedData);
            v.removeEventListener("stalled", onStalled);
            v.removeEventListener("error", onError);
        };
    }, [auto, activated]);

    const objectFit = fit === "contain" ? "object-contain" : "object-cover";

    return (
        <div ref={containerRef} className={`relative w-full h-full ${className}`}>
            <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full ${objectFit} bg-black`}
                src={activated ? src : undefined}
                poster={poster || undefined}
                muted={muted}
                loop={loop}
                playsInline
                preload={preload}
                controls={controls}
                autoPlay={auto}
            />

            {!ready && !error && (
                <div className="absolute inset-0 grid place-items-center bg-black/40">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/70 border-t-transparent" />
                </div>
            )}

            {!!error && (
                <div className="absolute inset-0 grid place-items-center text-white bg-black/70 text-sm px-4 text-center">
                    {error}
                </div>
            )}
        </div>
    );
}
