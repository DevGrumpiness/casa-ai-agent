"use client";

import { Reservation } from "@/types/reservations";
import { useEffect, useMemo, useState } from "react";
import ReservationForm from "./reservationForm";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [reservations, setReservations] = useState<Array<Reservation>>([]);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  const pendingReservations = useMemo(
    () =>
      reservations
        .filter((reservation) => reservation.status === "pending")
        .sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        ),
    [reservations]
  );

  const filteredReservations = useMemo(() => {
    const filtered = selectedDate
      ? reservations.filter(
        (reservation) => reservation.date === selectedDate
      )
      : reservations;

    return [...filtered].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );
  }, [reservations, selectedDate]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReservations.length / ITEMS_PER_PAGE)
  );

  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setCurrentPage(1);
    setShowReservationForm(false);
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.slice(0, 10).split("-");

    return `${day}.${month}.${year}`;
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Reservierungen
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Casa Vazquez
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              Ausstehende Reservierungen
            </h2>

            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              {pendingReservations.length}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
            {pendingReservations.length === 0 ? (
              <div className="px-6 py-6 text-sm text-zinc-500">
                Keine Reservierungen müssen bestätigt werden.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-amber-50 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Datum</th>
                      <th className="px-4 py-3">Uhrzeit</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Personen</th>
                      <th className="px-4 py-3">Telefon</th>
                      <th className="px-4 py-3">Kommentar</th>
                      <th className="px-4 py-3">Aktion</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {pendingReservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        className="hover:bg-zinc-50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {formatDate(reservation.date)}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.time}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.name}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.party_size}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.phone_number}
                        </td>

                        <td className="max-w-xs truncate px-4 py-3 text-zinc-500">
                          {reservation.comment || "–"}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              toggleReservationStatus(reservation)
                            }
                            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                          >
                            Bestätigen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Reservierungen
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {selectedDate
                  ? `${filteredReservations.length} Reservierungen am ${formatDate(
                    selectedDate
                  )}`
                  : `${filteredReservations.length} Reservierungen insgesamt`}
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label
                  htmlFor="reservation-date"
                  className="mb-1 block text-xs font-medium text-zinc-600"
                >
                  Datum
                </label>

                <input
                  id="reservation-date"
                  type="date"
                  value={selectedDate}
                  onChange={(event) =>
                    handleDateChange(event.target.value)
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              {selectedDate && (
                <button
                  onClick={() => setShowReservationForm(true)}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
                >
                  Neue Reservierung
                </button>
              )}

              {selectedDate && (
                <button
                  onClick={() => handleDateChange("")}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm transition hover:bg-zinc-50"
                >
                  Alle Tage
                </button>
              )}
            </div>
          </div>

          {showReservationForm && selectedDate && (
            <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <ReservationForm
                initialDate={selectedDate}
                onCreated={(reservation) => {
                  setReservations((current) => [
                    ...current,
                    reservation,
                  ]);
                  setShowReservationForm(false);
                }}
              />
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Datum</th>
                    <th className="px-4 py-3">Uhrzeit</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Personen</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3">Kommentar</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {paginatedReservations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-zinc-500"
                      >
                        {selectedDate
                          ? "Keine Reservierungen für dieses Datum."
                          : "Keine Reservierungen vorhanden."}
                      </td>
                    </tr>
                  ) : (
                    paginatedReservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        className="hover:bg-zinc-50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {formatDate(reservation.date)}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.time}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.name}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.party_size}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.phone_number}
                        </td>

                        <td className="max-w-xs truncate px-4 py-3 text-zinc-500">
                          {reservation.comment || "–"}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.status === "pending" ? (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                              Ausstehend
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                              Bestätigt
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredReservations.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
                <span className="text-sm text-zinc-500">
                  Seite {currentPage} von {totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => page - 1)
                    }
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Zurück
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}