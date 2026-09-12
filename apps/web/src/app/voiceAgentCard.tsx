const VoiceAgentCard = () => {
    const phoneHint = process.env.NEXT_PUBLIC_VOICE_AGENT_PHONE_HINT;
    const contactUrl = process.env.NEXT_PUBLIC_VOICE_AGENT_CONTACT_URL;

    return (
        <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>

                        <span className="text-xs font-semibold uppercase tracking-wide text-green-400">
                            Live
                        </span>
                    </div>

                    <h2 className="text-lg font-semibold text-zinc-100">
                        Live Voice Agent
                    </h2>

                    <p className="mt-1 max-w-md text-sm text-zinc-400">
                        Call the AI agent and make a real reservation.
                    </p>

                    {phoneHint && (
                        <p className="mt-3 inline-block rounded-lg bg-zinc-800 px-3 py-2 font-mono text-xl font-semibold tracking-widest text-zinc-100">
                            {phoneHint}
                        </p>
                    )}
                </div>

                {contactUrl && (
                    <div className="text-right">
                        <p className="text-xs text-zinc-400">Want to try it?</p>

                        <a
                            href={contactUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-zinc-100 underline decoration-zinc-600 underline-offset-4 transition hover:text-zinc-300"
                        >
                            Request the demo number →
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default VoiceAgentCard;
