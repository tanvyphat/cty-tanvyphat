'use client';

import { useEffect } from 'react';

export default function ZaloChatWidget() {
    useEffect(() => {
        const scriptUrl = "https://sp.zalo.me/plugins/sdk.js";
        const checkExist = document.querySelector(`script[src="${scriptUrl}"]`);
        if (!checkExist) {
            // Protect native JSON.stringify from being overwritten by Zalo SDK
            // Zalo SDK includes an old polyfill that causes "Converting circular structure to JSON"
            // when it interacts with React's FiberNodes in Server Components/Client Components.
            const originalStringify = JSON.stringify;
            Object.defineProperty(JSON, 'stringify', {
                value: originalStringify,
                writable: false,
                configurable: true
            });

            const script = document.createElement("script");
            script.src = scriptUrl;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <div
            className="zalo-chat-widget"
            data-oaid="1377439457201992738"
            data-welcome-message="Em chào Anh/Chị ạ, Anh/Chị cần em hỗ trợ gì ạ"
            data-autopopup="0"
            data-width="380"
            data-height="520"
        />
    );
}
