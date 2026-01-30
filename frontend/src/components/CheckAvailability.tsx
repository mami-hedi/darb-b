import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/gallery/photo7.jpeg";

export function CheckAvailability({ onSearch }: { onSearch: (checkin: string, checkout: string) => void }) {
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleCheckinChange = (value: string) => {
    setCheckin(value);
    if (checkout && checkout <= value) setCheckout("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkin || !checkout) return alert("Veuillez sélectionner les deux dates.");
    if (checkout <= checkin) return alert("La date de départ doit être après la date d'arrivée.");
    onSearch(checkin, checkout);
  };

  return (
    <>
      {/* Hero Section (style identique aux autres pages) */}
      <section
  className="relative h-[60vh] flex items-center justify-center"
  
>
  {/* Overlay identique aux autres pages */}
  <div className="absolute inset-0 bg-primary/60" />

  <div className="relative z-10 text-center container-custom">
    <h1 className="font-display text-5xl md:text-6xl font-semibold text-primary-foreground mb-4">
      Vérifiez la disponibilité
    </h1>
    <p className="font-body text-lg text-primary-foreground/90">
      Sélectionnez vos dates pour réserver votre séjour
    </p>
  </div>
</section>




      {/* Formulaire dans une section séparée */}
      <section className="py-12">
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm mb-1">Date d'arrivée</label>
              <Input
                type="date"
                min={today}
                value={checkin}
                onChange={(e) => handleCheckinChange(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Date de départ</label>
              <Input
                type="date"
                min={checkin || today}
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                disabled={!checkin}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-black"
            >
              Vérifier
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
