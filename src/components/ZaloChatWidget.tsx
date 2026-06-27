'use client';

import { useEffect } from 'react';

export default function ZaloChatWidget() {
    useEffect(() => {
        // Chỉ load script 1 lần
        if (!document.querySelector('script[src="https://sp.zalo.me/plugins/sdk.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://sp.zalo.me/plugins/sdk.js';
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