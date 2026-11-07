import { store } from '@/src/data/store'

export default function ContactCTA() {
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-4 font-bold text-lg text-amber-700">
        Liên hệ để được báo giá sỉ tốt nhất
      </p>
      <div className="flex flex-col gap-3">
        <a href={`tel:${store.phone}`} className="flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 px-6 py-3.5 text-white font-bold transition-colors">
          Gọi điện: {store.phoneDisplay}
        </a>
        <div className="grid grid-cols-2 gap-3">
          <a href={store.zalo} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-xl bg-[#0068FF] hover:bg-[#0054cc] px-4 py-3 text-white font-semibold transition-colors">Nhắn Zalo</a>
          <a href={store.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-xl bg-[#1877F2] hover:bg-[#0c63d4] px-4 py-3 text-white font-semibold transition-colors">Facebook</a>
        </div>
      </div>
    </div>
  )
}
