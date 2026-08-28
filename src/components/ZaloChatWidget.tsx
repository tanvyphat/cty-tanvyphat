'use client';

import { useEffect } from 'react';

// Mở rộng kiểu dữ liệu cho window để TypeScript không báo lỗi thuộc tính lạ
declare global {
    interface Window {
        __zaloJsonPatched?: boolean;
    }
}

export default function ZaloChatWidget() {
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.__zaloJsonPatched) {
            const originalStringify = JSON.stringify;

            // Ép kiểu hàm stringify tường minh để tránh lỗi cú pháp TS
            (JSON.stringify as unknown) = function (
                value: unknown,
                replacer?: (this: unknown, key: string, value: unknown) => unknown | Array<number | string>,
                space?: string | number
            ): string {
                try {
                    return originalStringify(value, replacer as Parameters<typeof JSON.stringify>[1], space);
                } catch (err: unknown) {
                    const error = err as Error;
                    if (error?.message?.includes('circular structure')) {
                        try {
                            const seen = new WeakSet<object>();
                            return originalStringify(
                                value,
                                function (this: unknown, key: string, val: unknown) {
                                    if (typeof val === 'object' && val !== null) {
                                        if (seen.has(val)) return undefined;
                                        seen.add(val);
                                    }
                                    if (typeof replacer === 'function') {
                                        return replacer.call(this, key, val);
                                    }
                                    return val;
                                },
                                space
                            );
                        } catch {
                            return '{}';
                        }
                    }
                    throw err;
                }
            };

            window.__zaloJsonPatched = true;
        }

        const scriptUrl = "https://sp.zalo.me/plugins/sdk.js";
        const checkExist = document.querySelector(`script[src="${scriptUrl}"]`);
        if (!checkExist) {
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