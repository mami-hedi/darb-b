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
  price: number;
}

export function AdminReservations() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    status: "confirmed" as any,
    payment_status: "unpaid" as any,
    advance_amount: 0,
  });

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
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchReservations();
    fetchRooms();
    const socket = io(BACKEND_URL);
    socket.on("reservationUpdated", fetchReservations);
    return () => { socket.disconnect(); };
  }, []);

  const openForm = (reservation?: Reservation) => {
    if (reservation) {
      setEditingReservation(reservation);
      setFormData({
        room_id: reservation.room_id,
        name: reservation.name,
        email: reservation.email || "",
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
        room_id: 0, name: "", email: "", phone: "", checkin: "", checkout: "",
        message: "", status: "confirmed", payment_status: "unpaid", advance_amount: 0,
      });
    }
    setFormOpen(true);
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoom = rooms.find(r => r.id === Number(formData.room_id));
    const start = new Date(formData.checkin);
    const end = new Date(formData.checkout);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      toast({ title: "Erreur", description: "Dates invalides", variant: "destructive" });
      return;
    }

    const total = nights * (selectedRoom?.price || 0);
    const payload = { ...formData, nights, total };

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

  const filtered = reservations.filter(r => 
    (statusFilter === "all" || r.status === statusFilter) &&
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.room_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar active="reservations" />
      <main className="flex-1 p-4 md:p-8 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Réservations</h1>
          <AdminNotifications />
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <Input 
            placeholder="Rechercher un client ou une chambre..." 
            className="md:max-w-xs bg-white shadow-sm" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <select className="border rounded px-3 bg-white shadow-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
            <Button onClick={() => openForm()} className="bg-blue-600 hover:bg-blue-700 shadow-md">+ Nouvelle</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4">Chambre / Client</th>
                <th className="p-4 text-center">Dates & Nuits</th>
                <th className="p-4 text-center">Finances</th>
                <th className="p-4 text-center">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-700">{r.room_name}</div>
                    <div className="text-sm text-blue-600 font-medium">{r.name}</div>
                    <div className="text-xs text-gray-400 italic">{r.email || "Pas d'email"}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="text-sm font-medium">{new Date(r.checkin).toLocaleDateString()} → {new Date(r.checkout).toLocaleDateString()}</div>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{r.nights} nuits</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-bold text-gray-800">{r.total} DT</div>
                    {r.payment_status === 'partial' && <div className="text-[10px] text-orange-600">Avance: {r.advance_amount} DT</div>}
                    <div className={`text-[10px] font-bold uppercase ${r.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                      {r.payment_status === 'partial' ? 'Partiel' : r.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick={() => openForm(r)} className="text-blue-500 hover:text-blue-700 transition"><FaEdit size={18} /></button>
                    <button onClick={() => { if(confirm("Supprimer ?")) fetch(`${BACKEND_URL}/api/admin/reservations/${r.id}`, { method: "DELETE" }).then(() => fetchReservations()) }} className="text-red-400 hover:text-red-600 transition"><FaTrash size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal avec gestion Email et Avance */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-xl font-bold">{editingReservation ? 'Modifier la fiche' : 'Nouvelle Réservation'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSaveReservation} className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2">
                <Label>Chambre *</Label>
                <select value={formData.room_id} onChange={(e) => setFormData({...formData, room_id: Number(e.target.value)})} className="w-full border rounded-md p-2 mt-1">
                  <option value="">Choisir une chambre...</option>
                  {rooms.map(room => <option key={room.id} value={room.id}>{room.name} ({room.price} DT/nuit)</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <Label>Nom complet du client</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1" placeholder="Ex: Ahmed Ben Salah" />
              </div>
              <div className="col-span-2">
                <Label>Adresse Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1" placeholder="client@email.com" />
              </div>
              <div className="col-span-2">
                <Label>Téléphone</Label>
                <PhoneField value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
              </div>
              <div>
                <Label>Arrivée</Label>
                <Input type="date" value={formData.checkin} onChange={(e) => setFormData({...formData, checkin: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Départ</Label>
                <Input type="date" value={formData.checkout} onChange={(e) => setFormData({...formData, checkout: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>État Paiement</Label>
                <select value={formData.payment_status} onChange={(e) => setFormData({...formData, payment_status: e.target.value as any})} className="w-full border rounded-md p-2 mt-1 text-sm">
                  <option value="unpaid">Non payé</option>
                  <option value="partial">Avance / Partiel</option>
                  <option value="paid">Totalité payée</option>
                </select>
              </div>

              {/* Champ Avance : N'apparaît que si payment_status est 'partial' */}
              {formData.payment_status === "partial" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <Label className="text-orange-600 font-bold">Montant Avance (DT)</Label>
                  <Input type="number" value={formData.advance_amount} onChange={(e) => setFormData({...formData, advance_amount: Number(e.target.value)})} className="mt-1 border-orange-300" />
                </div>
              )}

              <div className={formData.payment_status !== "partial" ? "col-span-1" : "col-span-2"}>
                <Label>Statut Réservation</Label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full border rounded-md p-2 mt-1 text-sm font-bold">
                  <option value="pending text-yellow-600">En attente</option>
                  <option value="confirmed text-green-600">Confirmée</option>
                  <option value="cancelled text-red-600">Annulée</option>
                </select>
              </div>
              <div className="col-span-2 pt-2">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6">
                  {editingReservation ? 'Mettre à jour' : 'Créer la réservation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}