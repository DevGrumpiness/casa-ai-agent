"use client";

import { Reservation } from "@/types/reservations";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminUnlockModal from "./adminUnlockModal";
import ReservationForm from "./reservationForm";
import VoiceAgentCard from "./voiceAgentCard";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [reservations, setReservations] = useState<Array<Reservation>>([]);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });

        const data = response.ok ? await response.json() : null;
        setIsAuthenticated(Boolean(data?.authenticated));
      } catch (error) {
        console.error("Fehler beim Prüfen der Sitzung:", error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) {
      return;
    }

    const fetchReservations = async () => {
      try {
        const response = await fetch("/api/reservations", {
          cache: "no-store",
          credentials: "include",
        });

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
  }, [isAuthenticated]);

  const handleUnlockSuccess = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "include",
      });

      const data = response.ok ? await response.json() : null;
      const authenticated = Boolean(data?.authenticated);

      setIsAuthenticated(authenticated);

      if (authenticated) {
        setShowUnlockModal(false);
      }

      return authenticated;
    } catch (error) {
      console.error("Fehler beim Prüfen der Sitzung:", error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const handleLock = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Fehler beim Sperren:", error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  const toggleReservationStatus = async (reservation: Reservation) => {
    const newStatus =
      reservation.status === "pending" ? "confirmed" : "pending";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservation.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
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

  const addDays = (date: string, delta: number) => {
    const base = date ? new Date(`${date}T00:00:00`) : new Date();
    base.setDate(base.getDate() + delta);
    return base.toISOString().slice(0, 10);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    const deltaY = event.changedTouches[0].clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    const SWIPE_THRESHOLD = 60;

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) < Math.abs(deltaY)
    ) {
      return;
    }

    handleDateChange(addDays(selectedDate, deltaX < 0 ? 1 : -1));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Reservierungen
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Casa Vazquez
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <VoiceAgentCard />

        <section className="mb-8 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-100">
              {isAuthenticated
                ? "Personal data unlocked"
                : "Personal data protected"}
            </p>

            <p className="mt-0.5 text-xs text-zinc-400">
              {isAuthenticated
                ? "Guest names, phone numbers and comments are shown in full."
                : "Unlock to view guest names, phone numbers and comments."}
            </p>
          </div>

          {isAuthenticated ? (
            <button
              onClick={handleLock}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
            >
              Lock
            </button>
          ) : (
            <button
              onClick={() => setShowUnlockModal(true)}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
            >
              Unlock personal data
            </button>
          )}
        </section>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              Ausstehende Reservierungen
            </h2>

            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-400">
              {pendingReservations.length}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-amber-900/40 bg-zinc-900 shadow-sm">
            {pendingReservations.length === 0 ? (
              <div className="px-6 py-6 text-sm text-zinc-400">
                Keine Reservierungen müssen bestätigt werden.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-amber-500/10 text-xs uppercase text-zinc-400">
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

                  <tbody className="divide-y divide-zinc-800">
                    {pendingReservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        className="hover:bg-zinc-800/60"
                      >
                        <td className="px-4 py-3 font-medium">
                          {formatDate(reservation.date)}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.time}
                        </td>

                        <td
                          className={
                            isAuthenticated
                              ? "px-4 py-3"
                              : "px-4 py-3 font-mono text-zinc-500"
                          }
                        >
                          {reservation.name}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.party_size}
                        </td>

                        <td
                          className={
                            isAuthenticated
                              ? "px-4 py-3"
                              : "px-4 py-3 font-mono text-zinc-500"
                          }
                        >
                          {reservation.phone_number}
                        </td>

                        <td className="max-w-xs truncate px-4 py-3 text-zinc-400">
                          {isAuthenticated ? reservation.comment || "–" : "🔒"}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              toggleReservationStatus(reservation)
                            }
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
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

        <section
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Reservierungen
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                {selectedDate
                  ? `${filteredReservations.length} Reservierungen am ${formatDate(
                    selectedDate
                  )}`
                  : `${filteredReservations.length} Reservierungen insgesamt`}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Auf Tablet: nach links oder rechts wischen, um den Tag zu wechseln.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label
                  htmlFor="reservation-date"
                  className="mb-1 block text-xs font-medium text-zinc-400"
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
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition [color-scheme:dark] focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
                />
              </div>

              {selectedDate && (
                <button
                  onClick={() => setShowReservationForm(true)}
                  className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
                >
                  Neue Reservierung
                </button>
              )}

              {selectedDate && (
                <button
                  onClick={() => handleDateChange("")}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                >
                  Alle Tage
                </button>
              )}
            </div>
          </div>

          {showReservationForm && selectedDate && (
            <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
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

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/60 text-xs uppercase text-zinc-400">
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

                <tbody className="divide-y divide-zinc-800">
                  {paginatedReservations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-zinc-400"
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
                        className="hover:bg-zinc-800/60"
                      >
                        <td className="px-4 py-3 font-medium">
                          {formatDate(reservation.date)}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.time}
                        </td>

                        <td
                          className={
                            isAuthenticated
                              ? "px-4 py-3"
                              : "px-4 py-3 font-mono text-zinc-500"
                          }
                        >
                          {reservation.name}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.party_size}
                        </td>

                        <td
                          className={
                            isAuthenticated
                              ? "px-4 py-3"
                              : "px-4 py-3 font-mono text-zinc-500"
                          }
                        >
                          {reservation.phone_number}
                        </td>

                        <td className="max-w-xs truncate px-4 py-3 text-zinc-400">
                          {isAuthenticated ? reservation.comment || "–" : "🔒"}
                        </td>

                        <td className="px-4 py-3">
                          {reservation.status === "pending" ? (
                            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-400">
                              Ausstehend
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
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
              <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3">
                <span className="text-sm text-zinc-400">
                  Seite {currentPage} von {totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => page - 1)
                    }
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Zurück
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {showUnlockModal && (
        <AdminUnlockModal
          onClose={() => setShowUnlockModal(false)}
          onSuccess={handleUnlockSuccess}
        />
      )}
    </div>
  );
}