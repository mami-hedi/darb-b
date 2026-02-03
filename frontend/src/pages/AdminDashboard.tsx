import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Sidebar } from "@/components/Sidebar";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darb-b.onrender.com";

interface Reservation {
  id: number;
  name: string;      // Corrigé (était client)
  room_id: number;   // Corrigé (était chambre)
  checkin: string;
  checkout: string;
  status: string;
  total: number;     // Corrigé (était price)
}

export function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [kpis, setKpis] = useState({
    occupied: 0,
    available: 0,
    today: 0,
    upcoming: 0,
    canceled: 0,
    revenue: 0,
    confirmed: 0
  });
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Fetch Chambres
      const roomsRes = await fetch(`${BACKEND_URL}/api/admin/rooms`);
      const roomsData = await roomsRes.json();
      setTotalRooms(roomsData.length);
      const occupiedCount = roomsData.filter((r: any) => r.status === "occupée").length;

      // 2. Fetch Réservations
      const resRes = await fetch(`${BACKEND_URL}/api/reservations`);
      const data: Reservation[] = await resRes.json();
      setReservations(data);

      // Calcul des KPI
      const confirmed = data.filter(r => r.status === "confirmed");
      const revToday = confirmed
        .filter(r => r.checkin.startsWith(todayStr))
        .reduce((sum, r) => sum + Number(r.total), 0);

      setKpis({
        occupied: occupiedCount,
        available: roomsData.length - occupiedCount,
        today: data.filter(r => r.checkin.startsWith(todayStr)).length,
        upcoming: data.filter(r => r.checkin > todayStr).length,
        canceled: data.filter(r => r.status === "cancelled").length,
        revenue: revToday,
        confirmed: confirmed.length
      });

      // Revenus par mois (Stats)
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthLabel = d.toLocaleString("fr-FR", { month: "short" });
        const monthYear = d.getMonth() + "-" + d.getFullYear();
        
        const revenue = confirmed
          .filter(r => {
            const date = new Date(r.checkin);
            return (date.getMonth() + "-" + date.getFullYear()) === monthYear;
          })
          .reduce((sum, r) => sum + Number(r.total), 0);

        return { month: monthLabel, revenue };
      });
      setMonthlyRevenueData(monthlyData);

    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reservations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchData(); // Rafraîchir les données
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="dashboard" />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
          <button onClick={fetchData} className="bg-white p-2 rounded shadow hover:bg-gray-100 transition">🔄 Actualiser</button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Chambres" value={totalRooms} color="bg-blue-500" />
          <StatCard title="Occupées" value={kpis.occupied} color="bg-orange-500" />
          <StatCard title="Revenus Jour" value={`${kpis.revenue} DT`} color="bg-green-600" />
          <StatCard title="Confirmées" value={kpis.confirmed} color="bg-indigo-600" />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Revenus Mensuels (DT)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Aperçu Rapide</h2>
            <div className="space-y-4">
              <QuickInfo label="Arrivées aujourd'hui" value={kpis.today} />
              <QuickInfo label="Réservations à venir" value={kpis.upcoming} />
              <QuickInfo label="Annulations" value={kpis.canceled} />
              <QuickInfo label="Chambres Libres" value={kpis.available} />
            </div>
          </div>
        </div>

        {/* Tableau des réservations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Dernières Réservations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Dates</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.slice(0, 10).map(res => (
                  <tr key={res.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{res.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(res.checkin).toLocaleDateString('fr-FR')} → {new Date(res.checkout).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{res.total} DT</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={res.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {res.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                          className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Confirmer
                        </button>
                      )}
                      {res.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                          className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
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

// Composants utilitaires locaux
function StatCard({ title, value, color }: any) {
  return (
    <div className={`${color} p-6 rounded-xl shadow-sm text-white`}>
      <p className="text-sm opacity-80 mb-1 uppercase font-bold">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function QuickInfo({ label, value }: any) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: { label: 'En attente', class: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmée', class: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Annulée', class: 'bg-red-100 text-red-700' }
  };
  const config = configs[status] || configs.pending;
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.class}`}>{config.label}</span>;
}