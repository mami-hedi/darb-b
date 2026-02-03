import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckAvailability } from "@/components/CheckAvailability";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

interface Room {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

export default function CheckRoomsPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darb-b.onrender.com";

  const [selectedCheckin, setSelectedCheckin] = useState("");
  const [selectedCheckout, setSelectedCheckout] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const isPastDate = (dateStr: string) => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < todayDate;
  };

  // Fonction pour rechercher les chambres disponibles
  const searchRooms = async (checkin: string, checkout: string) => {
    setLoading(true);
    setError(null);
    setRooms([]);

    setSelectedCheckin(checkin);
    setSelectedCheckout(checkout);

    if (isPastDate(checkin) || isPastDate(checkout)) {
      setError("La date choisie est dans le passé.");
      setLoading(false);
      return;
    }

    if (checkout <= checkin) {
      setError("La date de départ doit être après la date d'arrivée.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Correction de l'URL avec BACKEND_URL et les backticks `
      const res = await fetch(
        `${BACKEND_URL}/api/rooms/available?checkin=${checkin}&checkout=${checkout}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur lors de la récupération des chambres.");
      }

      const data: Room[] = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Données de chambres invalides.");
      }

      setRooms(data);
    } catch (err: any) {
      setError(err.message || "Erreur serveur.");
    }

    setLoading(false);
  };

  // Redirection vers la page d'une chambre
  const goToRoom = (room: Room) => {
    navigate(`/chambres/${room.name}?checkin=${selectedCheckin}&checkout=${selectedCheckout}`);
  };

  return (
    <Layout>
      <div className=" max-w-8xl mx-auto">
        {/* Hero + Formulaire */}
        <CheckAvailability onSearch={searchRooms} />

        {/* Messages */}
        {loading && <p className="text-center mt-4">Chargement des chambres...</p>}
        {error && <p className="text-center text-red-600 font-medium mt-4">{error}</p>}

        {/* Liste des chambres */}
        <h2 className="text-xl font-bold mt-6 mb-4 text-center">
          Chambres disponibles
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
  {!loading && !error && rooms.length === 0 && (
    
      <p className="text-gray-600 text-center col-span-3">
      Aucune chambre disponible pour ces dates.
    </p>
    
  )}

  {rooms.map((room) => (
    <div key={room.id} className="border rounded py-4 px-6 shadow-sm mx-4">
      <h3 className="font-bold text-lg">{room.name}</h3>
      <p className="text-gray-600">{room.price} DT / nuit</p>

      <Button
        className="w-full bg-blue-500 hover:bg-yellow-600 text-black"
        onClick={() => goToRoom(room)}
      >
        Réserver
      </Button>
    </div>
  ))}
</div>

      </div>
    </Layout>
  );
}
