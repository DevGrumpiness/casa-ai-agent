"use client";
import { Reservation } from "@/types/reservations";
import { useEffect, useState } from "react";
import ReservationForm from "./reservationForm";

export default function Home() {

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("http://localhost:8000/reservations", {
          cache: "no-store",
        })
        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(`Fehler beim Abrufen der Reservierungen: ${response.status} ${response.statusText} ${responseText}`);
        }
        const data: Array<Reservation> = await response.json();
        console.log("Reservierungen:", data);
        setReservations(data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Reservierungen:", error);
        setError("Reservierungen konnten nicht abgerufen werden. Bitte versuchen Sie es später erneut.");
      }
    };
    fetchReservations();
  }, []);


  const [reservations, setReservations] = useState<Array<Reservation>>([]);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-2xl font-bold mb-4">Reservierungen</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 cursor-pointer hover:bg-blue-600 transition-colors"
          onClick={() => !showReservationForm && setShowReservationForm(true)}>Neue Reservierung
        </button>
        {showReservationForm &&
          <ReservationForm
            onCreated={(reservation) => {
              setReservations([...reservations, reservation]);
              setShowReservationForm(false);
            }}
          />}
        <table className="w-full border border-gray-300 dark:border-gray-700 table-auto md:table-fixed ">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              <th>Datum</th>
              <th>Uhrzeit</th>
              <th>Name</th>
              <th>Personen</th>
              <th>Telefonnummer</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            )}
            {reservations.length === 0 && !error ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Keine Reservierungen vorhanden.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-gray-300 dark:border-gray-700">
                  <td className="">{reservation.date}</td>
                  <td className="">{reservation.time}</td>
                  <td className="">{reservation.name}</td>
                  <td className="">{reservation.party_size}</td>
                  <td className="">{reservation.phone_number}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );


}

