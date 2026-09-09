"use client";

import { Reservation } from "@/types/reservations";
import { useEffect, useState } from "react";
import ReservationForm from "./reservationForm";

export default function Home() {
  const [reservations, setReservations] = useState<Array<Reservation>>([]);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const responseText = await response.text();

          throw new Error(
            `Fehler beim Abrufen der Reservierungen: ${response.status} ${response.statusText} ${responseText}`
          );
        }

        const data: Array<Reservation> = await response.json();
        setReservations(data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Reservierungen:", error);

        setError(
          "Reservierungen konnten nicht abgerufen werden. Bitte versuchen Sie es später erneut."
        );
      }
    };

    fetchReservations();
  }, []);

  const toggleReservationStatus = async (reservation: Reservation) => {
    const newStatus =
      reservation.status === "pending" ? "confirmed" : "pending";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservation.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Status konnte nicht geändert werden.");
      }

      setReservations((current) =>
        current.map((item) =>
          item.id === reservation.id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (error) {
      console.error("Fehler beim Ändern des Status:", error);
      setError("Status konnte nicht geändert werden.");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-2xl font-bold mb-4">Reservierungen</h1>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 cursor-pointer hover:bg-blue-600 transition-colors"
          onClick={() => !showReservationForm && setShowReservationForm(true)}
        >
          Neue Reservierung
        </button>

        {showReservationForm && (
          <ReservationForm
            onCreated={(reservation) => {
              setReservations((current) => [...current, reservation]);
              setShowReservationForm(false);
            }}
          />
        )}

        <table className="w-full border border-gray-300 dark:border-gray-700 table-auto">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              <th>Datum</th>
              <th>Uhrzeit</th>
              <th>Name</th>
              <th>Personen</th>
              <th>Telefonnummer</th>
              <th>Kommentar</th>
              <th>Status</th>
              <th>Aktion</th>
            </tr>
          </thead>

          <tbody>
            {error && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            )}

            {reservations.length === 0 && !error ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Keine Reservierungen vorhanden.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-t border-gray-300 dark:border-gray-700"
                >
                  <td>{reservation.date}</td>
                  <td>{reservation.time}</td>
                  <td>{reservation.name}</td>
                  <td>{reservation.party_size}</td>
                  <td>{reservation.phone_number}</td>
                  <td>{reservation.comment}</td>

                  <td>
                    {reservation.status === "pending" ? (
                      <span className="rounded bg-yellow-500/20 px-2 py-1 text-yellow-500">
                        Ausstehend
                      </span>
                    ) : (
                      <span className="rounded bg-green-500/20 px-2 py-1 text-green-500">
                        Bestätigt
                      </span>
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() => toggleReservationStatus(reservation)}
                      className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 cursor-pointer"
                    >
                      {reservation.status === "pending"
                        ? "Bestätigen"
                        : "Zurück auf ausstehend"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}