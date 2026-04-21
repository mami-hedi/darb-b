import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { 
  FaBed, FaCheckCircle, FaMoneyBillWave, FaClock, 
  FaCalendarCheck, FaExclamationTriangle, FaSync, FaWhatsapp, FaBroom 
} from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darb-b.onrender.com";

interface Reservation {
  id: number;
  name: string;
  phone?: string; // Ajouté pour WhatsApp
  room_id: number;
  checkin: string;
  checkout: string;
  status: string;
  total: number;
}

export function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    occupied: 0,
    available: 0,
    dirty: 0, // Partie 2: Housekeeping
    todayArrivals: 0,
    upcoming: 0,
    canceled: 0,
    revenueToday: 0,
    revenueMonth: 0, // Partie 1: CA Mensuel
    confirmed: 0
  });
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // 1. Fetch Chambres
      const roomsRes = await fetch(`${BACKEND_URL}/api/admin/rooms`);
      const roomsData = await roomsRes.json();
      setRooms(roomsData);

      // 2. Fetch Réservations
      const resRes = await fetch(`${BACKEND_URL}/api/admin/reservations`);
      const data: Reservation[] = await resRes.json();
      setReservations(data);

      // --- CALCULS DES NOUVEAUX KPI ---
      const confirmedRes = data.filter(r => r.status === "confirmed");
      
      // CA du jour vs CA du mois (Partie 1)
      const revToday = confirmedRes
        .filter(r => r.checkin.startsWith(todayStr))
        .reduce((sum, r) => sum + Number(r.total || 0), 0);

      const revMonth = confirmedRes
        .filter(r => {
          const d = new Date(r.checkin);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + Number(r.total || 0), 0);

      // Housekeeping (Partie 2)
      const dirtyCount = roomsData.filter((r: any) => r.housekeeping === "dirty" || r.needs_cleaning).length;
      const occupiedCount = roomsData.filter((r: any) => r.status === "occupée" || r.status === "occupied").length;

      setKpis({
        occupied: occupiedCount,
        available: Math.max(0, roomsData.length - occupiedCount),
        dirty: dirtyCount,
        todayArrivals: data.filter(r => r.checkin.startsWith(todayStr)).length,
        upcoming: data.filter(r => r.checkin > todayStr && r.status !== 'cancelled').length,
        canceled: data.filter(r => r.status === "cancelled").length,
        revenueToday: revToday,
        revenueMonth: revMonth,
        confirmed: confirmedRes.length
      });

      // Stats graphiques (6 mois)
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const mLabel = d.toLocaleString("fr-FR", { month: "short" });
        const revenue = confirmedRes
          .filter(r => {
            const date = new Date(r.checkin);
            return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
          })
          .reduce((sum, r) => sum + Number(r.total || 0), 0);
        return { month: mLabel, revenue };
      });
      setMonthlyRevenueData(monthlyData);

    } catch (err) {
      console.error("Erreur dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Partie 3: Action WhatsApp
  const sendWhatsApp = (phone: string | undefined, name: string) => {
    if(!phone) return alert("Numéro non renseigné");
    const msg = `Bonjour ${name}, nous confirmons votre séjour à Dar B&B. À quelle heure prévoyez-vous d'arriver ?`;
    window.open(`https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const COLORS = ['#f97316', '#10b981', '#ef4444']; // Occupé, Libre, Sale

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar active="dashboard" />

      <main className="flex-1 p-4 md:p-8 pt-24 md:pt-10 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dar B&B Analytics</h1>
            <p className="text-slate-500 font-medium">Gestion opérationnelle en temps réel.</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 font-bold text-slate-700 hover:bg-slate-50">
            <FaSync className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>

        {/* KPI Cards (Partie 1: Intégration CA Mensuel) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Occupation" value={`${Math.round((kpis.occupied / rooms.length) * 100) || 0}%`} icon={FaClock} color="text-orange-600" bg="bg-orange-50" />
          <StatCard title="CA Mensuel" value={`${kpis.revenueMonth} DT`} icon={FaMoneyBillWave} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="À Nettoyer" value={kpis.dirty} icon={FaBroom} color="text-red-500" bg="bg-red-50" />
          <StatCard title="Confirmés" value={kpis.confirmed} icon={FaCheckCircle} color="text-indigo-600" bg="bg-indigo-50" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
              <span>Croissance des Revenus (DT)</span>
              <span className="text-xs text-slate-400 font-normal italic">Derniers 6 mois</span>
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Partie 2: Pie Chart avec Housekeeping */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">État du Parc</h2>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Occupées", value: kpis.occupied },
                      { name: "Libres", value: kpis.available - kpis.dirty },
                      { name: "Sales", value: kpis.dirty }
                    ]}
                    innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value"
                  >
                    <Cell fill="#f97316" />
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black">{rooms.length}</span>
                <span className="text-[10px] uppercase text-slate-400">Chambres</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section (Partie 4 & 5: Alertes & Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Alertes</h3>
            <QuickInfoCard label="Arrivées ce jour" value={kpis.todayArrivals} icon={FaCalendarCheck} color="text-blue-500" />
            
            {/* Partie 4: Alertes visuelles */}
            {kpis.dirty > 0 && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-500" />
                    <p className="text-xs font-bold text-red-700">{kpis.dirty} chambres attendent le ménage !</p>
                </div>
            )}
            
            <div className="bg-indigo-600 p-6 rounded-3xl text-white">
               <p className="text-xs font-bold opacity-80 uppercase">CA Aujourd'hui</p>
               <p className="text-3xl font-black mt-1">{kpis.revenueToday} DT</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Dernières Activités</h2>
              <div className="flex gap-2">
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold">FILTRER PAR : RÉCENTES</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4 font-bold">Client</th>
                    <th className="px-6 py-4 font-bold text-center">Séjour</th>
                    <th className="px-6 py-4 font-bold text-center">Total</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reservations.slice(0, 6).map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-sm">{res.name}</p>
                        <p className="text-[10px] text-slate-400">Réservation #{res.id}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[11px] font-bold text-slate-600 italic">
                          {new Date(res.checkin).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})} → {new Date(res.checkout).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-slate-700">{res.total} DT</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Partie 3: Bouton WhatsApp */}
                          <button 
                            onClick={() => sendWhatsApp(res.phone, res.name)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all shadow-sm"
                            title="Contacter sur WhatsApp"
                          >
                            <FaWhatsapp size={16}/>
                          </button>
                          <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-200">
                            <FaCalendarCheck size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Composants réutilisables
function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:scale-[1.02] transition-transform">
      <div className={`${bg} ${color} p-4 rounded-2xl`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function QuickInfoCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Icon className={color} size={18} />
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <span className="text-lg font-black text-slate-800">{value}</span>
    </div>
  );
}
