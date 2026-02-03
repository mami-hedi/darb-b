import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { io } from "socket.io-client";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { AdminNotifications } from "@/components/AdminNotifications";
import { PhoneField } from "@/components/PhoneField";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darb-b.onrender.com";

interface Reservation {
  id: number;
  room_id: number;
  room_name: string;
  name: string;
  email: string;
  phone: string;
  checkin: string;
  checkout: string;
  created_at: string;
  message?: string;
  status: "confirmed" | "cancelled" | "pending";
  payment_status: "paid" | "unpaid" | "partial";
  advance_amount: number;
  total: number;
  nights: number;
}

interface Room {
  id: number;
  name: string;
  price: number; // Important pour le calcul du total
}

export function AdminReservations() {
  const { toast } = useToast();
  const location = useLocation();
  const openedFromAvailability = useRef(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState({
    room_id: 0,
    name: "",
    email: "",
    phone: "",
    checkin: "",
    checkout: "",
    message: "",
    status: "confirmed",
    payment_status: "unpaid",
    advance_amount: 0,
  });

  // --- Fetch Data ---
  const fetchReservations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/reservations`);
      const data = await res.json();
      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReservations(data);
    } catch (error) {
      toast({ title: "Erreur", description: "Chargement échoué", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error("Erreur chambres:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchRooms();
    const socket = io(BACKEND_URL);
    socket.on("reservationUpdated", fetchReservations);
    return () => { socket.disconnect(); };
  }, []);

  // --- Logique du Formulaire ---
  const openForm = (reservation?: Reservation, initialData?: any) => {
    if (reservation) {
      setEditingReservation(reservation);
      setFormData({
        room_id: reservation.room_id,
        name: reservation.name,
        email: reservation.email,
        phone: reservation.phone,
        checkin: reservation.checkin.split('T')[0],
        checkout: reservation.checkout.split('T')[0],
        message: reservation.message || "",
        status: reservation.status,
        payment_status: reservation.payment_status || "unpaid",
        advance_amount: reservation.advance_amount || 0,
      });
    } else {
      setEditingReservation(null);
      setFormData({
        room_id: initialData?.room_id ?? 0,
        name: "",
        email: "",
        phone: "",
        checkin: initialData?.checkin ?? "",
        checkout: initialData?.checkout ?? "",
        message: "",
        status: "confirmed",
        payment_status: "unpaid",
        advance_amount: 0,
      });
    }
    setFormOpen(true);
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Calcul du prix et nuits
    const selectedRoom = rooms.find(r => r.id === Number(formData.room_id));
    const start = new Date(formData.checkin);
    const end = new Date(formData.checkout);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      toast({ title: "Erreur", description: "Dates invalides", variant: "destructive" });
      return;
    }

    const total = nights * (selectedRoom?.price || 0);

    // 2. Préparation du payload
    const payload = { 
      ...formData, 
      nights, 
      total,
      room_id: Number(formData.room_id),
      advance_amount: Number(formData.advance_amount)
    };

    try {
      const url = editingReservation 
        ? `${BACKEND_URL}/api/admin/reservations/${editingReservation.id}`
        : `${BACKEND_URL}/api/admin/reservations`;
      
      const res = await fetch(url, {
        method: editingReservation ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      toast({ title: "Succès", description: "Réservation enregistrée" });
      setFormOpen(false);
      fetchReservations();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteReservation = async (id: number) => {
    if (!confirm("Supprimer ?")) return;
    await fetch(`${BACKEND_URL}/api/admin/reservations/${id}`, { method: "DELETE" });
    fetchReservations();
  };

  // --- Filtres et Pagination ---
  const filtered = reservations
    .filter(r => (statusFilter === "all" ? true : r.status === statusFilter))
    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.room_name.toLowerCase().includes(searchQuery.toLowerCase()));

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar active="reservations" />

      <main className="flex-1 p-4 md:p-8 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Réservations</h1>
          <AdminNotifications />
        </div>

        {/* Stats Rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow text-center">
            <p className="text-gray-500 text-sm">Total</p>
            <p className="text-xl font-bold">{reservations.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded shadow text-center">
            <p className="text-green-600 text-sm">Confirmées</p>
            <p className="text-xl font-bold">{reservations.filter(r => r.status === 'confirmed').length}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded shadow text-center">
            <p className="text-yellow-600 text-sm">En attente</p>
            <p className="text-xl font-bold">{reservations.filter(r => r.status === 'pending').length}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded shadow text-center">
            <p className="text-blue-600 text-sm">Payées</p>
            <p className="text-xl font-bold">{reservations.filter(r => r.payment_status === 'paid').length}</p>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <Input 
            placeholder="Rechercher..." 
            className="md:max-w-xs bg-white" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <select 
              className="border rounded px-3 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
            <Button onClick={() => openForm()} className="bg-blue-600 hover:bg-blue-700">
              + Nouvelle Réservation
            </Button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase">
                <th className="p-4">Chambre</th>
                <th className="p-4">Client</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Nuits</th>
                <th className="p-4 text-center">Total</th>
                <th className="p-4 text-center">Paiement</th>
                <th className="p-4 text-center">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{r.room_name}</td>
                  <td className="p-4">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.phone}</div>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(r.checkin).toLocaleDateString()}
                    <span className="mx-1 text-gray-400">→</span>
                    {new Date(r.checkout).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">{r.nights}</td>
                  <td className="p-4 text-center font-bold text-blue-600">{r.total} DT</td>
                  <td className="p-4 text-center text-xs">
                    <span className={`px-2 py-1 rounded-full ${r.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.status === 'confirmed' ? 'Confirmé' : r.status === 'pending' ? 'En attente' : 'Annulé'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openForm(r)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                    <button onClick={() => handleDeleteReservation(r.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Formulaire */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingReservation ? 'Modifier' : 'Ajouter'} Réservation</DialogTitle></DialogHeader>
            <form onSubmit={handleSaveReservation} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Chambre *</Label>
                <select 
                  name="room_id" 
                  value={formData.room_id} 
                  onChange={(e) => setFormData({...formData, room_id: Number(e.target.value)})} 
                  className="w-full border rounded p-2"
                >
                  <option value="">Sélectionner...</option>
                  {rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <Label>Nom</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Label>Téléphone</Label>
                <PhoneField value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
              </div>
              <div>
                <Label>Check-in</Label>
                <Input type="date" value={formData.checkin} onChange={(e) => setFormData({...formData, checkin: e.target.value})} />
              </div>
              <div>
                <Label>Check-out</Label>
                <Input type="date" value={formData.checkout} onChange={(e) => setFormData({...formData, checkout: e.target.value})} />
              </div>
              <div>
                <Label>Paiement</Label>
                <select value={formData.payment_status} onChange={(e) => setFormData({...formData, payment_status: e.target.value as any})} className="w-full border rounded p-2 text-sm">
                  <option value="unpaid">Non payé</option>
                  <option value="paid">Payé</option>
                  <option value="partial">Avance</option>
                </select>
              </div>
              <div>
                <Label>Statut</Label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full border rounded p-2 text-sm">
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              <div className="col-span-2">
                <Button type="submit" className="w-full bg-blue-600">Enregistrer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}