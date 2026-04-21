import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { 
  FaBed, FaCheckCircle, FaMoneyBillWave, FaClock, 
  FaCalendarCheck, FaSync, FaWhatsapp 
} from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darb-b.onrender.com";

interface Reservation {
  id: number;
  name: string;
  phone?: string;
  room_id: number;
  checkin: string;
  checkout: string;
  status: string;
  total: number;
}

interface Room {
  id: number;
  name: string;
  status: string;
  type: string;
}

export function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    occupied: 0,
    available: 0,
    todayArrivals: 0,
    upcoming: 0,
    revenueToday: 0,
    revenueMonth: 0,
    confirmedCount: 0
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
      const roomsData: Room[] = await roomsRes.json();
      setRooms(roomsData);

      // 2. Fetch Réservations
      const resRes = await fetch(`${BACKEND_URL}/api/admin/reservations`);
      const data: Reservation[] = await resRes.json();
      setReservations(data);

      // --- CALCULS KPI ---
      const confirmedRes = data.filter(r => r.status === "confirmed");
      
      const revToday = confirmedRes
        .filter(r => r.checkin.startsWith(todayStr))
        .reduce((sum, r) => sum + Number(r.total || 0), 0);

      const revMonth = confirmedRes
        .filter(r => {
          const d = new Date(r.checkin);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + Number(r.total || 0), 0);

      const occupiedCount = roomsData.filter(r => r.status === "occupée" || r.status === "occupied").length;

      setKpis({
        occupied: occupiedCount,
        available: Math.max(0, roomsData.length - occupiedCount),
        todayArrivals: data.filter(r => r.checkin.startsWith(todayStr)).length,
        upcoming: data.filter(r => r.checkin > todayStr && r.status !== 'cancelled').length,
        revenueToday: revToday,
        revenueMonth: revMonth,
        confirmedCount: confirmedRes.length
      });

      // Stats 6 mois
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

  const sendWhatsApp = (phone: string | undefined, name: string) => {
    if(!phone) return alert("Numéro non renseigné");
    const msg = `Bonjour ${name}, nous confirmons votre séjour à Dar B&B. À quelle heure prévoyez-vous d'arriver ?`;
    window.open(`https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const PIE_COLORS = ['#f97316', '#10b981']; // Orange pour Occupé, Vert pour Libre

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar active="dashboard" />

      <main className="flex-1 p-4 md:p-8 pt-24 md:pt-10 overflow-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dar B&B Analytics</h1>
            <p className="text-slate-500 font-medium">Suivi de l'activité en temps réel.</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all">
            <FaSync className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Chambres" value={rooms.length} icon={FaBed} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Occupation" value={`${Math.round((kpis.occupied / rooms.length) * 100) || 0}%`} icon={FaClock} color="text-orange-600" bg="bg-orange-50" />
          <StatCard title="CA Mensuel" value={`${kpis.revenueMonth} DT`} icon={FaMoneyBillWave} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="Confirmés" value={kpis.confirmedCount} icon={FaCheckCircle} color="text-indigo-600" bg="bg-indigo-50" />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-500" /> Revenus Mensuels (DT)
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Disponibilité</h2>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Occupées", value: kpis.occupied },
                      { name: "Libres", value: kpis.available }
                    ]}
                    innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value"
                  >
                    {PIE_COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{kpis.available}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Libres</span>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER SECTION: ALERTS & PLANNING */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Column */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Aujourd'hui</h3>
            <QuickInfoCard label="Arrivées prévues" value={kpis.todayArrivals} icon={FaCalendarCheck} color="text-blue-500" />
            
            <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
               <p className="text-xs font-bold opacity-80 uppercase">CA Aujourd'hui</p>
               <p className="text-3xl font-black mt-1">{kpis.revenueToday} DT</p>
               <p className="text-[10px] mt-2 opacity-70 italic">Total réservations : {kpis.confirmedCount}</p>
            </div>
          </div>

          {/* PLANNING SECTION */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Planning de la Semaine</h2>
                <p className="text-xs text-slate-400">Occupation visuelle des chambres</p>
              </div>
              <div className="flex gap-3">
                 <div className="flex items-center gap-1 text-[10px] font-bold"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Occupé</div>
                 <div className="flex items-center gap-1 text-[10px] font-bold"><span className="w-2 h-2 rounded-full bg-slate-100"></span> Libre</div>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[10px] uppercase text-slate-400 font-black w-32">Chambre</th>
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() + i);
                      return (
                        <th key={i} className="p-2 text-center border-l border-slate-50 min-w-[60px]">
                          <p className="text-[10px] uppercase text-slate-400 font-bold">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                          <p className="text-sm font-black text-slate-700">{d.getDate()}</p>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="border-t border-slate-50 group hover:bg-slate-50/30">
                      <td className="p-3">
                        <p className="text-sm font-bold text-slate-800">{room.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{room.type}</p>
                      </td>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + i);
                        const dateStr = d.toISOString().split('T')[0];
                        
                        const reservation = reservations.find(res => 
                          res.room_id === room.id && 
                          res.status === 'confirmed' &&
                          dateStr >= res.checkin && 
                          dateStr < res.checkout
                        );

                        return (
                          <td key={i} className="p-1 border-l border-slate-50 relative">
                            {reservation ? (
                              <div 
                                onClick={() => sendWhatsApp(reservation.phone, reservation.name)}
                                className="h-10 rounded-lg bg-indigo-500 shadow-sm flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-all group/cell"
                                title={`${reservation.name} (WhatsApp)`}
                              >
                                <FaWhatsapp className="text-white opacity-0 group-hover/cell:opacity-100 transition-opacity" size={14} />
                              </div>
                            ) : (
                              <div className="h-10 rounded-lg bg-slate-50 group-hover:bg-white transition-colors"></div>
                            )}
                          </td>
                        );
                      })}
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

// UI COMPONENTS
function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all">
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
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <Icon className={color} size={18} />
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <span className="text-lg font-black text-slate-800">{value}</span>
    </div>
  );
}
