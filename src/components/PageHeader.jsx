import { useEffect, useRef } from "react";

export default function PageHeader({height = '400px', children}) {
    const fxRef = useRef(null);

    useEffect(() => {
        const el = fxRef.current;
        const FH = window.FinisherHeader;
        if (!el || !FH) return;

        const settings = {
            "count": 7,
            "size": {
                "min": 500,
                "max": 700,
                "pulse": 0.6
            },
            "speed": {
                "x": {
                    "min": 0.5,
                    "max": 1.1
                },
                "y": {
                    "min": 0.5,
                    "max": 1.1
                }
            },
            "colors": {
                "background": "#ad97ff",
                "particles": [
                    "#7edbff",
                    "#ffac5a",
                    "#ff7b82",
                    "#ffe565",
                    "#6d63ff"
                ]
            },
            "blending": "overlay",
            "opacity": {
                "center": 1,
                "edge": 0.1
            },
            "skew": -2.9,
            "shapes": [
                "c"
            ]
        };
        try {
            new FH(settings, el);
        } catch {
            el.classList.add("finisher-header");
            new FH(settings);
        }

        return () => {
            el.innerHTML = "";
        };
    }, []);

    return (
        <header className="relative mb-6" style={{minHeight: height}}>
            <div ref={fxRef} className="absolute inset-0 pointer-events-none " />
            <div className="relative z-10 -mt-10 flex flex-col gap-4 items-center justify-center ">
                {children}
            </div>
        </header>
    );
}
