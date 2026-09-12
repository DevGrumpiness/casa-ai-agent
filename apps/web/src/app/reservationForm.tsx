import { Reservation } from "@/types/reservations";
import { useEffect, useState } from "react";

interface ReservationFormProps {
    initialDate?: string;
    onCreated: (reservation: Reservation) => void;
}

const ReservationForm = ({
    initialDate = "",
    onCreated,
}: ReservationFormProps) => {
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState("");
    const [name, setName] = useState("");
    const [partySize, setPartySize] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [comment, setComment] = useState("");
    const [chefOverride, setChefOverride] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setDate(initialDate);
    }, [initialDate]);

    const formatDate = (date: string) => {
        if (!date) {
            return "";
        }

        const [year, month, day] = date.slice(0, 10).split("-");

        return `${day}.${month}.${year}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);

        const newReservation = {
            date,
            time,
            name,
            party_size: partySize,
            phone_number: phoneNumber,
            chef_override: chefOverride,
            comment,
        };

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newReservation),
                }
            );

            if (!res.ok) {
                const errorResponse = await res.json();

                setError(
                    errorResponse.detail ||
                    "Fehler beim Erstellen der Reservierung"
                );

                return;
            }

            const createdReservation: Reservation =
                await res.json();

            onCreated(createdReservation);
        } catch (error) {
            console.error(
                "Fehler beim Erstellen der Reservierung:",
                error
            );

            setError(
                "Reservierung konnte nicht erstellt werden."
            );
        }
    };

    const inputClassName =
        "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition [color-scheme:dark] focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700";

    const labelClassName =
        "mb-1.5 block text-sm font-medium text-zinc-300";

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-100">
                    Neue Reservierung
                </h3>

                {date && (
                    <p className="mt-1 text-sm text-zinc-400">
                        Reservierung für den {formatDate(date)}
                    </p>
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-5"
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="date"
                            className={labelClassName}
                        >
                            Datum
                        </label>

                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) =>
                                setDate(e.target.value)
                            }
                            className={inputClassName}
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="time"
                            className={labelClassName}
                        >
                            Uhrzeit
                        </label>

                        <input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) =>
                                setTime(e.target.value)
                            }
                            className={inputClassName}
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="name"
                            className={labelClassName}
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            className={inputClassName}
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="partySize"
                            className={labelClassName}
                        >
                            Personen
                        </label>

                        <input
                            id="partySize"
                            type="number"
                            value={partySize}
                            onChange={(e) =>
                                setPartySize(
                                    Number(e.target.value)
                                )
                            }
                            className={inputClassName}
                            required
                            min={1}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="phoneNumber"
                        className={labelClassName}
                    >
                        Telefonnummer
                    </label>

                    <input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                            setPhoneNumber(e.target.value)
                        }
                        className={inputClassName}
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="comment"
                        className={labelClassName}
                    >
                        Kommentar
                    </label>

                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) =>
                            setComment(e.target.value)
                        }
                        className={`${inputClassName} min-h-24 resize-y`}
                    />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
                    <input
                        id="chefOverride"
                        type="checkbox"
                        checked={chefOverride}
                        onChange={(e) =>
                            setChefOverride(
                                e.target.checked
                            )
                        }
                        className="h-4 w-4"
                    />

                    <span>
                        <span className="block text-sm font-medium text-zinc-200">
                            Chef-Override
                        </span>

                        <span className="block text-xs text-zinc-500">
                            (darf nur von Chef gesetzt werden)
                        </span>
                    </span>
                </label>

                {error && (
                    <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-white"
                    >
                        Reservierung speichern
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReservationForm;