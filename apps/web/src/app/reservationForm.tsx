import { Reservation } from "@/types/reservations";
import { useState } from "react";

interface ReservationFormProps {
    onCreated: (reservation: Reservation) => void;
}

const ReservationForm = ({ onCreated }: ReservationFormProps) => {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [name, setName] = useState("");
    const [partySize, setPartySize] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [comment, setComment] = useState("");
    const [chefOverride, setChefOverride] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newReservation = {
            date,
            time,
            name,
            party_size: partySize,
            phone_number: phoneNumber,
            chef_override: chefOverride,
            comment,
        };
        const res = await fetch("http://localhost:8000/reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newReservation),
        });
        if (res.ok) {
            const createdReservation: Reservation = await res.json();
            onCreated(createdReservation);
        } else {
            const errorText = await res.json();
            setError(errorText.detail || "Fehler beim Erstellen der Reservierung");
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4 bg-gray-100 dark:bg-gray-900 p-4 rounded shadow-md font-sans dark:text-white max-w-4xl w-full">

                <div className="flex flex-col gap-1">
                    <label htmlFor="date">Datum:</label>
                    <input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="time">Uhrzeit:</label>
                    <input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="name">Name:</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="partySize">Personen:</label>
                    <input
                        id="partySize"
                        type="number"
                        value={partySize}
                        onChange={(e) => setPartySize(Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                        required
                        min={1}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="phoneNumber">Telefonnummer:</label>
                    <input
                        id="phoneNumber"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="comment">Kommentar:</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                    />
                </div>
                <div className="flex flex-row gap-1">
                    <label htmlFor="chefOverride">Chef override:</label>
                    <input
                        id="chefOverride"
                        type="checkbox"
                        checked={chefOverride}
                        onChange={(e) => setChefOverride(e.target.checked)}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                    /><span className="text-sm text-gray-500 dark:text-gray-400"> (Nur für den Chef)</span>
                </div>
                <br />
                <br />
                <button type="submit" className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 cursor-pointer hover:bg-blue-600 transition-colors">Reservierung speichern</button>
                {error && <p className="text-red-500">{error}</p>}

            </form>
        </>
    );
};

export default ReservationForm;
