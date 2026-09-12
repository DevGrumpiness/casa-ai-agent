"use client";

import { useState } from "react";

interface AdminUnlockModalProps {
    onClose: () => void;
    onSuccess: () => Promise<boolean>;
}

const AdminUnlockModal = ({ onClose, onSuccess }: AdminUnlockModalProps) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                setError("Falsches Passwort.");
                return;
            }

            const verified = await onSuccess();

            if (!verified) {
                setError("Anmeldung konnte nicht bestätigt werden. Bitte erneut versuchen.");
            }
        } catch (error) {
            console.error("Fehler beim Entsperren:", error);
            setError("Entsperren fehlgeschlagen. Bitte erneut versuchen.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-zinc-100">
                    Personal data entsperren
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
                    Admin-Passwort eingeben, um echte Gästedaten anzuzeigen.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
                    <input
                        type="password"
                        autoFocus
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
                        placeholder="Admin-Passwort"
                        required
                    />

                    {error && (
                        <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                        >
                            Abbrechen
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
                        >
                            Entsperren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminUnlockModal;
