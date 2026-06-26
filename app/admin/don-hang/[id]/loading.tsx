function Skeleton({className}: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded ${className}`}/>
}

export default function DonHangChiTietLoading() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Skeleton className="h-4 w-20"/>
                    <Skeleton className="h-5 w-32"/>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Status card */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-6 w-24 rounded-full"/>
                        <Skeleton className="h-4 w-32"/>
                    </div>
                    <Skeleton className="h-3 w-64"/>
                </div>

                {/* Products card */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <Skeleton className="h-4 w-20 mb-4"/>
                    <div className="space-y-3">
                        {Array.from({length: 3}).map((_, i) => (
                            <div key={i}
                                 className="flex justify-between items-start pb-2 border-b border-gray-50 last:border-0">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-40"/>
                                    <Skeleton className="h-3 w-28"/>
                                </div>
                                <Skeleton className="h-4 w-20"/>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2">
                            <Skeleton className="h-4 w-24"/>
                            <Skeleton className="h-4 w-24"/>
                        </div>
                    </div>
                </div>

                {/* Customer card */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <Skeleton className="h-4 w-24 mb-4"/>
                    <div className="space-y-2">
                        {Array.from({length: 4}).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-56"/>
                        ))}
                    </div>
                </div>

                {/* Payment card */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <Skeleton className="h-4 w-40 mb-4"/>
                    <div className="space-y-2">
                        {Array.from({length: 3}).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-48"/>
                        ))}
                    </div>
                </div>

                {/* Status updater */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <Skeleton className="h-4 w-32 mb-3"/>
                    <div className="flex gap-2 flex-wrap">
                        {Array.from({length: 4}).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-28 rounded-lg"/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
