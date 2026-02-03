import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mountain, Waves, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Header } from "@/components/layout/Header";

import heroImage from "@/assets/gallery/hero-main.jpg";

interface Room {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darb-b.onrender.com";

const Index = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rooms`);
        if (!res.ok) throw new Error("Erreur chargement chambres");
        const data: Room[] = await res.json();
        setRooms(data.slice(0, 3)); // comme la maquette
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <Layout>
      <Header />

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-[#0f2a44]/75" />
        </div>

        <div className="relative z-10 text-center text-white container-custom">
          <p className="uppercase tracking-[0.3em] text-sm text-yellow-400 mb-6">
            Maison d’hôtes d’exception
          </p>

          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-semibold mb-6">
            Dar B&B
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 mb-10">
            Entre ciel et mer, découvrez un havre de paix où la nature et
            l’élégance se rencontrent pour une expérience inoubliable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-yellow-600 text-white hover:bg-yellow-500"
              asChild
            >
              <Link to="/chambres">Nos Chambres</Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              asChild
            >
              <Link to="/disponibilite">Recherche Disponibilité</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ATOUTS */}
      <section className="py-24 bg-secondary">
        <div className="container-custom grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 text-center shadow-soft">
            <Mountain className="mx-auto mb-4 text-primary" size={32} />
            <h3 className="font-display text-xl font-semibold mb-2">
              Vue Montagne
            </h3>
            <p className="text-muted-foreground text-sm">
              Réveillez-vous face aux sommets majestueux.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 text-center shadow-soft">
            <Waves className="mx-auto mb-4 text-primary" size={32} />
            <h3 className="font-display text-xl font-semibold mb-2">
              Vue Mer
            </h3>
            <p className="text-muted-foreground text-sm">
              Le bleu de la Méditerranée à perte de vue.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 text-center shadow-soft">
            <Sun className="mx-auto mb-4 text-primary" size={32} />
            <h3 className="font-display text-xl font-semibold mb-2">
              Sérénité
            </h3>
            <p className="text-muted-foreground text-sm">
              Un cadre paisible pour se ressourcer.
            </p>
          </div>
        </div>
      </section>

      {/* PRESENTATION */}
      <section className="py-24 bg-background">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-yellow-600 uppercase text-sm mb-4">
              Bienvenue
            </p>
            <h2 className="font-display text-4xl font-semibold mb-6">
              Une maison d’exception entre mer et montagne
            </h2>
            <p className="text-muted-foreground mb-6">
              <b>Dar B&B </b> vous accueille dans un cadre naturel unique, mêlant
              authenticité tunisienne et confort moderne pour un séjour
              inoubliable.
            </p>

            <Button asChild className="bg-primary text-white">
              <Link to="/a-propos">
                En savoir plus <ArrowRight size={18} />
              </Link>
            </Button>
          </div>

          <img
            src={heroImage}
            alt="Dar Seif"
            className="rounded-xl shadow-medium"
          />
        </div>
      </section>

      {/* CHAMBRES */}
      <section className="py-24 bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="uppercase text-yellow-600 text-sm mb-2">
              Hébergement
            </p>
            <h2 className="font-display text-4xl font-semibold">
              Nos chambres d’exception
            </h2>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">
              Chargement des chambres...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/chambres/${room.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-soft group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={
                        room.image
                          ? `${BACKEND_URL}${room.image}`
                          : "/placeholder-room.jpg"
                      }
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-2xl font-semibold mb-3">
                      {room.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {room.price}€ / nuit
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button className="bg-primary text-white" asChild>
              <Link to="/chambres">
                Voir toutes les chambres <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container-custom">
          <h2 className="font-display text-4xl font-semibold mb-6">
            Réservez votre séjour
          </h2>
          <p className="mb-8 text-white/90">
            Offrez-vous une pause dans un cadre idyllique.
          </p>
          <Button
            size="lg"
            className="bg-yellow-600 hover:bg-yellow-500"
            asChild
          >
            <Link to="/contact">
              Nous contacter <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
