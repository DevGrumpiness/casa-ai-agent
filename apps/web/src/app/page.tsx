import { Reservation } from "@/types/reservations";

export default function Home() {


  const reservations: Array<Reservation> = [];

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-2xl font-bold mb-4">Reservierungen</h1>
        <table className="w-full border border-gray-300 dark:border-gray-700">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Uhrzeit</th>
              <th>Name</th>
              <th>Personen</th>
              <th>Telefonnummer</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Keine Reservierungen vorhanden.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.date}</td>
                  <td>{reservation.time}</td>
                  <td>{reservation.name}</td>
                  <td>{reservation.people}</td>
                  <td>{reservation.phoneNumber}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
