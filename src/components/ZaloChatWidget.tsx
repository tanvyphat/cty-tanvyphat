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

    // Render the widget using dangerouslySetInnerHTML so React doesn't attach its internal Fiber
    // properties to the actual Zalo widget DOM node. This prevents the Zalo SDK from throwing
    // "Converting circular structure to JSON" when it tries to serialize the node.
    const widgetHtml = `
        <div
            class="zalo-chat-widget"
            data-oaid="1377439457201992738"
            data-welcome-message="Em chào Anh/Chị ạ, Anh/Chị cần em hỗ trợ gì ạ"
            data-autopopup="0"
            data-width="380"
            data-height="520"
        ></div>
    `;

    return (
        <div dangerouslySetInnerHTML={{ __html: widgetHtml }} />
    );
}
