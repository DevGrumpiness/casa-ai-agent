const VoiceAgentCard = () => {
  const phoneHint = process.env.NEXT_PUBLIC_VOICE_AGENT_PHONE_HINT;
  const contactUrl = process.env.NEXT_PUBLIC_VOICE_AGENT_CONTACT_URL;

  return (
    <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Live
            </span>
          </div>

          <h2 className="text-lg font-semibold text-zinc-900">
            Live Voice Agent
          </h2>

          <p className="mt-1 max-w-md text-sm text-zinc-500">
            The agent accepts real phone calls and creates reservations
            autonomously.
          </p>

          {phoneHint && (
            <p className="mt-3 font-mono text-base tracking-wide text-zinc-700">
              {phoneHint}
            </p>
          )}
        </div>

        {contactUrl && (
          <a
            href={contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Get demo access
          </a>
        )}
      </div>
    </section>
  );
};

export default VoiceAgentCard;
