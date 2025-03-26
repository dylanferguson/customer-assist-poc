export const TypingIndicator = () => {
    return (
        <div className="flex items-center gap-1 px-2 py-3 bg-gray-100 rounded-lg">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse_1s_infinite]" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse_1s_infinite_.2s]" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse_1s_infinite_.4s]" />
        </div>
    );
}
