import { Music, PlayCircle } from "lucide-react"

interface PreviewProps {
    image: string | null
    message: string
    from: string
    to: string
    youtubeLink: string
}

export function Preview({ image, message, from, to, youtubeLink }: PreviewProps) {
    return (
        <div className="w-full max-w-sm mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100 relative aspect-[9/16] flex flex-col">
            {/* Header / Brand */}
            <div className="absolute top-4 left-0 right-0 z-10 text-center">
                <span className="font-serif text-white drop-shadow-md text-lg font-bold tracking-widest uppercase opacity-90">
                    Paper Bloom
                </span>
            </div>

            {/* Main Image Area */}
            <div className="relative flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-muted-foreground text-sm flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 animate-pulse" />
                        Sua foto aparecerá aqui
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Content Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                <div className="mb-4">
                    <p className="font-script text-3xl mb-1 text-primary-foreground/90">
                        De: {from || "..."}
                    </p>
                    <p className="font-script text-3xl text-primary-foreground/90">
                        Para: {to || "..."}
                    </p>
                </div>

                <p className="text-sm leading-relaxed font-medium text-white/90 mb-6 line-clamp-4">
                    {message || "Sua mensagem especial aparecerá aqui..."}
                </p>

                {/* Music Player Mock */}
                {youtubeLink && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full p-2 pr-4 border border-white/20">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate text-white">
                                Música Especial
                            </p>
                            <p className="text-[10px] text-white/70 truncate">
                                Toque para ouvir
                            </p>
                        </div>
                        <Music className="w-4 h-4 text-white/70 animate-pulse" />
                    </div>
                )}
            </div>
        </div>
    )
}
