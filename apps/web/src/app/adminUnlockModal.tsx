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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-zinc-900">
                    Personal data entsperren
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                    Admin-Passwort eingeben, um echte Gästedaten anzuzeigen.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
                    <input
                        type="password"
                        autoFocus
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                        placeholder="Admin-Passwort"
                        required
                    />

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm transition hover:bg-zinc-50"
                        >
                            Abbrechen
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
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
