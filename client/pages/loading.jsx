export default function LoadingPage() {
    return (
        <main className="flex-center">
            <h1 className="font-gigantic jumping-text">
                {"Loading...".split("").map((char, i) => (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            animation: `bounce 1.2s ease-in-out infinite`,
                            animationDelay: `${i * 0.08}s`,
                        }}
                    >
                        {char}
                    </span>
                ))}
            </h1>
        </main>
    )
}