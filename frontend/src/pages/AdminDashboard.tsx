import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { Sidebar } from "@/components/Sidebar";

interface Reservation {
  id: number;
  client: string;
  chambre: string;
  checkin: string;
  checkout: string;
  status: string;
  price: number;
}

export function AdminDashboard() {
  // ----- States des KPI -----
  const [totalRooms, setTotalRooms] = useState(0);
  const [occupiedRooms, setOccupiedRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [reservationsToday, setReservationsToday] = useState(0);
  const [upcomingReservations, setUpcomingReservations] = useState(0);
  const [newClients, setNewClients] = useState(0);
  const [canceledReservations, setCanceledReservations] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [roomsReservedToday, setRoomsReservedToday] = useState(0);
  const [roomsFreeToday, setRoomsFreeToday] = useState(0);
  const [confirmedReservations, setConfirmedReservations] = useState(0);
  const [upcomingWeekReservations, setUpcomingWeekReservations] = useState(0);

  const [monthlyRevenueData, setMonthlyRevenueData] = useState<{month: string, revenue: number}[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0,10);
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().slice(0,10);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const firstDayMonth = new Date(new Date().getFullYear(), new Date().getMonth(),1).toISOString().slice(0,10);
    const lastDayMonth = new Date(new Date().getFullYear(), new Date().getMonth()+1,0).toISOString().slice(0,10);

    // -------- Chambres --------
    fetch("/api/admin/rooms")
      .then(res => res.json())
      .then(data => {
        setTotalRooms(data.length);
        const occupied = data.filter((r:any) => r.status === "occupée").length;
        setOccupiedRooms(occupied);
        setAvailableRooms(data.length - occupied);
      });

    // -------- Réservations --------
    fetch("/api/admin/reservations")
      .then(res => res.json())
      .then(data => {
        setReservations(data);

        // KPI généraux
        setReservationsToday(data.filter(r => r.checkin === todayStr).length);
        setUpcomingReservations(data.filter(r => r.checkin > todayStr).length);
        setCanceledReservations(data.filter(r => r.status === "annulée").length);

        const revenueToday = data
          .filter(r => r.checkin === todayStr && r.status === "confirmée")
          .reduce((sum, r) => sum + r.price, 0);
        setDailyRevenue(revenueToday);

        // Nouveaux KPI
        const roomsToday = data.filter(r => r.checkin === todayStr).length;
        setRoomsReservedToday(roomsToday);
        setRoomsFreeToday(totalRooms - roomsToday);
        setConfirmedReservations(data.filter(r => r.status === "confirmée").length);
        setUpcomingWeekReservations(data.filter(r => r.checkin > todayStr && r.checkin <= next7DaysStr).length);

        // Revenus par mois
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const monthStart = new Date(new Date().getFullYear(), i, 1);
          const monthEnd = new Date(new Date().getFullYear(), i + 1, 0);
          
          const revenue = data
            .filter(r => {
              const checkin = new Date(r.checkin);
              return checkin >= monthStart && checkin <= monthEnd && r.status === "confirmée";
            })
            .reduce((sum, r) => sum + r.price, 0);

          return {
            month: monthStart.toLocaleString("fr-FR", { month: "short" }),
            revenue,
          };
        });
        setMonthlyRevenueData(monthlyData);
      });

    // -------- Clients --------
    fetch("/api/admin/clients")
      .then(res => res.json())
      .then(data => {
        setNewClients(data.filter(c => new Date(c.created_at) >= weekAgo).length);
      });
  }, [totalRooms]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="dashboard" />

      {/* Contenu principal */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pt-20 md:pt-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Total Chambres</h2>
            <p className="text-2xl font-bold">{totalRooms}</p>
          </div>
          <div className="p-4 bg-green-100 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Occupées</h2>
            <p className="text-2xl font-bold">{occupiedRooms}</p>
          </div>
          <div className="p-4 bg-yellow-100 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Disponibles</h2>
            <p className="text-2xl font-bold">{availableRooms}</p>
          </div>
          <div className="p-4 bg-purple-100 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Réservations aujourd’hui</h2>
            <p className="text-2xl font-bold">{reservationsToday}</p>
          </div>

          <div className="p-4 bg-indigo-100 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Réservations à venir</h2>
            <p className="text-2xl font-bold">{upcomingReservations}</p>
          </div>
          <div className="p-4 bg-pink-100 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Nouveaux clients</h2>
            <p className="text-2xl font-bold">{newClients}</p>
          </div>
          <div className="p-4 bg-red-100 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Annulations</h2>
            <p className="text-2xl font-bold">{canceledReservations}</p>
          </div>
          <div className="p-4 bg-orange-100 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Revenus du jour</h2>
            <p className="text-2xl font-bold">{dailyRevenue} €</p>
          </div>

          {/* Nouveaux KPI */}
          <div className="p-4 bg-indigo-200 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Chambres réservées aujourd’hui</h2>
            <p className="text-2xl font-bold">{roomsReservedToday}</p>
          </div>
          <div className="p-4 bg-lime-200 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Chambres libres aujourd’hui</h2>
            <p className="text-2xl font-bold">{roomsFreeToday}</p>
          </div>
          <div className="p-4 bg-cyan-200 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Réservations confirmées</h2>
            <p className="text-2xl font-bold">{confirmedReservations}</p>
          </div>
          <div className="p-4 bg-green-200 rounded shadow text-center">
            <h2 className="text-lg font-semibold">Réservations à venir 7 jours</h2>
            <p className="text-2xl font-bold">{upcomingWeekReservations}</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Revenus par mois</h2>
            <BarChart
              width={500}
              height={300}
              data={monthlyRevenueData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value} €`} />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Réservations par statut</h2>
            <BarChart width={400} height={300} data={reservations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="id" fill="#8884d8" />
            </BarChart>
          </div>
        </div>

        {/* Tableau des réservations */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Réservations récentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border">Client</th>
                  <th className="px-4 py-2 border">Chambre</th>
                  <th className="px-4 py-2 border">Check-in</th>
                  <th className="px-4 py-2 border">Check-out</th>
                  <th className="px-4 py-2 border">Statut</th>
                  <th className="px-4 py-2 border">Prix</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res.id} className="odd:bg-gray-50">
                    <td className="px-4 py-2 border">{res.client}</td>
                    <td className="px-4 py-2 border">{res.chambre}</td>
                    <td className="px-4 py-2 border">{res.checkin}</td>
                    <td className="px-4 py-2 border">{res.checkout}</td>
                    <td className="px-4 py-2 border">{res.status}</td>
                    <td className="px-4 py-2 border">{res.price} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
