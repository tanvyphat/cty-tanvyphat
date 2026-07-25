"use client";
export const dynamic = 'force-dynamic'

import React, { useState, useMemo, useEffect, useRef } from "react";
import AdminNavbar from '@/app/admin/AdminNavbar'

import {
    Package,
    TrendingUp,
    PlusCircle,
    Calendar,
    Boxes,
    CheckCircle2,
    TrendingDown,
    AlertCircle,
    Filter,
    Trash2,
    Save,
    Info
} from "lucide-react";

// === INTERFACES ===
interface InventoryRecord {
    id: string;
    productCode: string;
    productName: string;
    attribute: string;
    systemStock: number;
    physicalStock: number;
    checkDate: string;
}

interface ToastMessage {
    id: string;
    message: string;
    type: "success" | "error";
}

interface ConfirmDialogState {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
}

// Đưa các hàm tạo dữ liệu động (impure functions) ra ngoài component
// để khắc phục triệt để lỗi ESLint "react-hooks/purity"
const generateUniqueId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
};

const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
};

export default function App() {
    // === STATES ===
    const [activeTab, setActiveTab] = useState<"dashboard" | "input" | "history">("dashboard");
    const [records, setRecords] = useState<InventoryRecord[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
        isOpen: false,
        message: "",
        onConfirm: () => {},
    });

    // State quản lý dữ liệu form (Dùng callback để khởi tạo Date an toàn)
    const [formData, setFormData] = useState(() => ({
        productCode: "",
        productName: "",
        attribute: "",
        systemStock: "",
        physicalStock: "",
        checkDate: getTodayDate(),
    }));

    // === HELPER FUNCTIONS ===
    const showToast = (message: string, type: "success" | "error" = "success") => {
        const id = generateUniqueId();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const openConfirm = (message: string, onConfirm: () => void) => {
        setConfirmDialog({ isOpen: true, message, onConfirm });
    };

    const closeConfirm = () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    };

    // === EVENT HANDLERS ===
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.productCode.trim() ||
            !formData.productName.trim() ||
            formData.systemStock === "" ||
            formData.physicalStock === ""
        ) {
            showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
            return;
        }

        const newRecord: InventoryRecord = {
            id: generateUniqueId(),
            productCode: formData.productCode.trim(),
            productName: formData.productName.trim(),
            attribute: formData.attribute.trim(),
            systemStock: Number(formData.systemStock),
            physicalStock: Number(formData.physicalStock),
            checkDate: formData.checkDate,
        };

        setRecords((prev) => [...prev, newRecord]);
        showToast("Đã thêm bản ghi thành công!");

        // Reset fields, keep date
        setFormData((prev) => ({
            ...prev,
            productCode: "",
            productName: "",
            attribute: "",
            systemStock: "",
            physicalStock: "",
        }));
    };

    const handleDelete = (id: string) => {
        openConfirm("Bạn có chắc chắn muốn xóa dòng dữ liệu này?", () => {
            setRecords((prev) => prev.filter((rec) => rec.id !== id));
            showToast("Đã xóa bản ghi thành công!");
            closeConfirm();
        });
    };

    const handleClearAll = () => {
        openConfirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại?", () => {
            setRecords([]);
            showToast("Đã xóa toàn bộ dữ liệu.");
            closeConfirm();
        });
    };

    // === ANALYSIS LOGIC ===
    const analysisData = useMemo(() => {
        const grouped: Record<string, any> = {};

        // 1. Group by Product Code
        records.forEach((rec) => {
            if (!grouped[rec.productCode]) {
                grouped[rec.productCode] = {
                    productCode: rec.productCode,
                    productName: rec.productName,
                    attribute: rec.attribute,
                    history: [],
                };
            }
            grouped[rec.productCode].history.push({ ...rec });
        });

        // 2. Analyze
        const results = Object.values(grouped).map((item) => {
            // Sort oldest to newest
            item.history.sort(
                (a: InventoryRecord, b: InventoryRecord) =>
                    new Date(a.checkDate).getTime() - new Date(b.checkDate).getTime()
            );

            // Calc diff
            item.history = item.history.map((h: any) => ({
                ...h,
                diff: h.physicalStock - h.systemStock,
            }));

            let consistentIssue = null;
            if (item.history.length >= 2) {
                const lastDiff = item.history[item.history.length - 1].diff;
                if (lastDiff !== 0) {
                    let countSameDiff = 1;
                    for (let i = item.history.length - 2; i >= 0; i--) {
                        if (item.history[i].diff === lastDiff) {
                            countSameDiff++;
                        } else {
                            break;
                        }
                    }

                    if (countSameDiff >= 2) {
                        consistentIssue = {
                            diffValue: lastDiff,
                            streak: countSameDiff,
                        };
                    }
                }
            }

            const latestCheck = item.history[item.history.length - 1];
            const latestDiff = latestCheck.diff;

            let status = "balanced";
            if (latestDiff > 0) status = "surplus";
            if (latestDiff < 0) status = "deficit";

            return {
                ...item,
                latestCheck,
                latestDiff,
                status,
                consistentIssue,
                totalChecks: item.history.length,
            };
        });

        return results;
    }, [records]);

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminNavbar/>
            <div className="text-slate-800 font-sans p-4 md:p-6 min-h-screen relative bg-slate-100">
                {/* Inline styles for custom scrollbar */}
                <style dangerouslySetInnerHTML={{
                    __html: `
            .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}} />

                {/* Toast Notifications */}
                <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`px-6 py-3 rounded-lg shadow-lg font-medium flex items-center transition-all duration-300 pointer-events-auto
                  ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}
                `}
                        >
                            {toast.type === "error" ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                            <span>{toast.message}</span>
                        </div>
                    ))}
                </div>

                {/* Confirm Dialog */}
                {confirmDialog.isOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                                <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                                Xác nhận hành động
                            </h3>
                            <p className="text-slate-600 mb-6 text-sm">{confirmDialog.message}</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeConfirm}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDialog.onConfirm}
                                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition shadow-sm"
                                >
                                    Đồng ý xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Container (Full width) */}
                <div className="w-full space-y-6">

                    {/* Header & Tabs */}
                    <header className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <div className="bg-blue-600 p-3 rounded-xl text-white mr-4 shadow-inner flex items-center justify-center">
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-800">Hệ Thống Dò Tồn Kho</h1>
                                <p className="text-slate-500 text-sm mt-1">So khớp tồn thực tế và tồn hệ thống - Tự động phát hiện sai lệch mạn tính</p>
                            </div>
                        </div>

                        <div className="flex space-x-1 md:space-x-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className={`flex items-center space-x-2 px-4 py-2.5 font-medium text-sm transition-colors duration-200 rounded-lg whitespace-nowrap
                    ${activeTab === "dashboard" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"}
                  `}
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>Phân tích & Dò tìm</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("input")}
                                className={`flex items-center space-x-2 px-4 py-2.5 font-medium text-sm transition-colors duration-200 rounded-lg whitespace-nowrap
                    ${activeTab === "input" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"}
                  `}
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Nhập liệu</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`flex items-center space-x-2 px-4 py-2.5 font-medium text-sm transition-colors duration-200 rounded-lg whitespace-nowrap
                    ${activeTab === "history" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"}
                  `}
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Lịch sử dữ liệu</span>
                            </button>
                        </div>
                    </header>

                    <main>
                        {}
                        {/* DASHBOARD VIEW */}
                        {activeTab === "dashboard" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {analysisData.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                                        <Boxes className="w-16 h-16 text-slate-300 mb-4" />
                                        <h3 className="text-xl font-medium text-slate-700">Chưa có dữ liệu kiểm kho</h3>
                                        <p className="mt-2 text-center max-w-md">Hãy nhập liệu để bắt đầu phân tích độ lệch.</p>
                                        <button
                                            onClick={() => setActiveTab("input")}
                                            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                        >
                                            Đến trang Nhập liệu
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Boxes className="w-6 h-6" /></div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium">Tổng sản phẩm</p>
                                                    <h4 className="text-2xl font-bold text-slate-800">{analysisData.length}</h4>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium">Khớp số lượng</p>
                                                    <h4 className="text-2xl font-bold text-slate-800">{analysisData.filter(d => d.status === 'balanced').length}</h4>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                                                <div className="p-3 bg-red-100 text-red-600 rounded-lg"><TrendingDown className="w-6 h-6" /></div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium">Thiếu hụt (Lệch âm)</p>
                                                    <h4 className="text-2xl font-bold text-slate-800">{analysisData.filter(d => d.status === 'deficit').length}</h4>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
                                                <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium">Dư thừa (Lệch dương)</p>
                                                    <h4 className="text-2xl font-bold text-slate-800">{analysisData.filter(d => d.status === 'surplus').length}</h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                                <h3 className="font-bold text-slate-800 flex items-center">
                                                    <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                                                    Báo Cáo Dò Tìm Chênh Lệch
                                                </h3>
                                            </div>

                                            <div className="divide-y divide-slate-100">
                                                {analysisData.map((item) => (
                                                    <div key={item.productCode} className="p-5 hover:bg-slate-50/50 transition">
                                                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
                                                            <div>
                                                                <h4 className="text-lg font-bold text-blue-900">{item.productName}</h4>
                                                                <div className="flex flex-wrap items-center text-sm text-slate-500 gap-2 mt-2">
                                                                    <span className="font-medium bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">Mã: {item.productCode}</span>
                                                                    {item.attribute && <span className="bg-white px-2 py-1 rounded border border-slate-200">Thuộc tính: {item.attribute}</span>}
                                                                </div>
                                                            </div>

                                                            {item.consistentIssue && (
                                                                <div className="mt-3 xl:mt-0 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start xl:max-w-md w-full">
                                                                    <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className="font-bold text-sm">Cảnh báo sai lệch có hệ thống!</p>
                                                                        <p className="text-xs mt-1 leading-relaxed">
                                                                            Sản phẩm bị lệch cố định <strong className="text-base">{Math.abs(item.consistentIssue.diffValue)}</strong> đơn vị
                                                                            ({item.consistentIssue.diffValue < 0 ? 'thiếu' : 'thừa'}) trong <strong className="text-base">{item.consistentIssue.streak}</strong> lần kiểm liên tiếp.
                                                                            <br/><span className="italic text-red-600">Gợi ý: Kiểm tra lại các phiếu xuất/nhập kho (VD: quên cộng/trừ {Math.abs(item.consistentIssue.diffValue)} đơn vị).</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-lg">
                                                            <table className="w-full text-sm text-left">
                                                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                                                <tr>
                                                                    <th className="px-4 py-3 whitespace-nowrap">Ngày kiểm</th>
                                                                    <th className="px-4 py-3 text-right whitespace-nowrap">Tồn hệ thống</th>
                                                                    <th className="px-4 py-3 text-right whitespace-nowrap">Tồn kho (Thực tế)</th>
                                                                    <th className="px-4 py-3 text-right whitespace-nowrap">Độ lệch (Thực tế - Hệ thống)</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {item.history.map((h: any, idx: number) => {
                                                                    let colorClass = "text-emerald-600";
                                                                    let prefix = "";
                                                                    if (h.diff > 0) { colorClass = "text-amber-500"; prefix = "+"; }
                                                                    if (h.diff < 0) { colorClass = "text-red-500"; }

                                                                    return (
                                                                        <tr key={idx} className="border-b border-slate-50 last:border-none">
                                                                            <td className="px-4 py-2 font-medium">{h.checkDate}</td>
                                                                            <td className="px-4 py-2 text-right">{h.systemStock}</td>
                                                                            <td className="px-4 py-2 text-right font-bold text-blue-600">{h.physicalStock}</td>
                                                                            <td className={`px-4 py-2 text-right font-bold ${colorClass}`}>
                                                                                {prefix}{h.diff}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {}
                        {/* INPUT VIEW */}
                        {activeTab === "input" && (
                            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                        <PlusCircle className="text-blue-600 w-6 h-6 mr-2" />
                                        Nhập liệu thủ công
                                    </h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã SP *</label>
                                                <input
                                                    type="text"
                                                    name="productCode"
                                                    value={formData.productCode}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    placeholder="VD: GDA3-70"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm *</label>
                                                <input
                                                    type="text"
                                                    name="productName"
                                                    value={formData.productName}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    placeholder="VD: Giấy Double 70 A3"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Màu sắc / Định lượng</label>
                                            <input
                                                type="text"
                                                name="attribute"
                                                value={formData.attribute}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                placeholder="VD: 70gsm, Đỏ, Xanh..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Tồn hệ thống *</label>
                                                <input
                                                    type="number"
                                                    name="systemStock"
                                                    value={formData.systemStock}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Tồn kho (Thực tế) *</label>
                                                <input
                                                    type="number"
                                                    name="physicalStock"
                                                    value={formData.physicalStock}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-blue-50 text-blue-800 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Ngày kiểm *</label>
                                            <input
                                                type="date"
                                                name="checkDate"
                                                value={formData.checkDate}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            />
                                        </div>

                                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition mt-4 flex justify-center items-center">
                                            <Save className="w-5 h-5 mr-2" />
                                            Lưu bản ghi
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {}
                        {/* HISTORY VIEW */}
                        {activeTab === "history" && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                    <h3 className="font-bold text-slate-800 flex items-center">
                                        <Filter className="text-slate-500 w-5 h-5 mr-2" />
                                        Tất cả dữ liệu đã nhập ({records.length})
                                    </h3>
                                    {records.length > 0 && (
                                        <button
                                            onClick={handleClearAll}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                                        >
                                            Xóa tất cả
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 whitespace-nowrap">Mã SP</th>
                                            <th className="px-4 py-3 min-w-[200px]">Tên sản phẩm</th>
                                            <th className="px-4 py-3">Thuộc tính</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Ngày kiểm</th>
                                            <th className="px-4 py-3 text-right whitespace-nowrap">Tồn HT</th>
                                            <th className="px-4 py-3 text-right whitespace-nowrap">Tồn Kho</th>
                                            <th className="px-4 py-3 text-right">Lệch</th>
                                            <th className="px-4 py-3 text-center">Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {records.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                                    Chưa có dữ liệu nào được ghi nhận.
                                                </td>
                                            </tr>
                                        ) : (
                                            [...records].sort((a,b) => new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime()).map((rec) => {
                                                const diff = rec.physicalStock - rec.systemStock;
                                                let colorClass = "text-emerald-500";
                                                let prefix = "";
                                                if (diff > 0) { colorClass = "text-amber-500"; prefix = "+"; }
                                                if (diff < 0) { colorClass = "text-red-500"; }

                                                return (
                                                    <tr key={rec.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                                        <td className="px-4 py-3 font-medium text-blue-700 whitespace-nowrap">{rec.productCode}</td>
                                                        <td className="px-4 py-3">{rec.productName}</td>
                                                        <td className="px-4 py-3 text-slate-500">{rec.attribute || "-"}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{rec.checkDate}</td>
                                                        <td className="px-4 py-3 text-right">{rec.systemStock}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-slate-800">{rec.physicalStock}</td>
                                                        <td className={`px-4 py-3 text-right font-bold ${colorClass}`}>{prefix}{diff}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => handleDelete(rec.id)}
                                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                                                title="Xóa bản ghi này"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
}