import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Coffee, Wifi, ArrowRight, Car, Mountain, Waves, Sun, MapPin, Utensils, Compass, Heart } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

import breakfastImage from "@/assets/breakfast.jpg";
import loungeImage from "@/assets/lounge.jpg";
import landscapeImage from "@/assets/gallery/hero-main.jpg"; // hero image similaire accueil

const mainServices = [
  {
    icon: Coffee,
    title: "Petit-déjeuner",
    description:
      "Savourez un petit-déjeuner généreux préparé avec des produits frais et locaux, servi sur notre terrasse avec vue sur la mer.",
  },
  {
    icon: Wifi,
    title: "Wi-Fi gratuit",
    description:
      "Restez connecté avec notre Wi-Fi haut débit disponible dans toute la maison et sur les terrasses.",
  },
  {
    icon: Car,
    title: "Parking privé",
    description: "Stationnement gratuit et sécurisé sur place pour tous nos hôtes.",
  },
  {
    icon: Sun,
    title: "Terrasses panoramiques",
    description:
      "Plusieurs espaces extérieurs aménagés pour profiter de la vue et du soleil à toute heure de la journée.",
  },
  {
    icon: Utensils,
    title: "Cuisine locale",
    description:
      "Sur demande, découvrez les saveurs de la cuisine tunisienne traditionnelle préparée par notre chef.",
  },
  {
    icon: Heart,
    title: "Service personnalisé",
    description:
      "Une équipe attentive à vos besoins pour un séjour sur mesure et des moments inoubliables.",
  },
];

const activities = [
  {
    icon: Mountain,
    title: "Randonnées en montagne",
    description:
      "Explorez les sentiers de montagne avec nos recommandations de circuits adaptés à tous les niveaux.",
  },
  {
    icon: Waves,
    title: "Plages secrètes",
    description:
      "Découvrez les plus belles criques et plages cachées de la région, à quelques minutes de la maison.",
  },
  {
    icon: Compass,
    title: "Excursions guidées",
    description: "Partez à la découverte des trésors de la région avec nos excursions organisées.",
  },
  {
    icon: MapPin,
    title: "Visites culturelles",
    description:
      "Sites historiques, villages traditionnels et marchés locaux à explorer aux alentours.",
  },
];

const Services = () => {
  return (
    <Layout>
      {/* HERO */}
      <section
        className="relative h-[60vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${landscapeImage})`, backgroundSize: "cover" }}
      >
        <div className="absolute inset-0 bg-[#0f2a44]/75" />
        <div className="relative z-10 text-center text-white container-custom">
          <h1 className="font-display text-5xl md:text-6xl font-semibold mb-4">
            Nos Services
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90">
            Découvrez toutes les prestations qui rendront votre séjour à Dar B&B inoubliable
          </p>
        </div>
      </section>

      {/* MAIN SERVICES */}
      <section className="py-24 bg-background">
        <div className="container-custom text-center mb-12">
          <h2 className="font-display text-4xl font-semibold mb-4">À votre service</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des prestations de qualité pour votre confort et votre bien-être.
          </p>
        </div>
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainServices.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-white p-8 rounded-xl shadow-soft text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-6 mx-auto">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BREAKFAST FEATURE */}
      <section className="py-24 bg-secondary">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={breakfastImage}
              alt="Petit-déjeuner à Dar Seif"
              className="rounded-xl shadow-medium w-full"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-yellow-600 uppercase text-sm mb-4">Gastronomie</p>
            <h2 className="font-display text-4xl font-semibold mb-6">
              Un petit-déjeuner d'exception
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Commencez chaque journée avec notre petit-déjeuner copieux, préparé à partir de produits frais et locaux.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Servi sur la terrasse panoramique, dégustez viennoiseries, fruits, œufs et fromages locaux avec vue sur la mer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section className="py-24 bg-background">
        <div className="container-custom text-center mb-12">
          <h2 className="font-display text-4xl font-semibold mb-4">Explorer la région</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            De nombreuses activités et découvertes vous attendent aux alentours de <b>Dar B&B</b>.
          </p>
        </div>
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-8">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="flex gap-6 p-6 bg-white rounded-xl shadow-soft"
            >
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full">
                  <activity.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold mb-2">{activity.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

        {/* CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container-custom">
          <h2 className="font-display text-4xl font-semibold mb-6">
            Prêt pour l'aventure ?
          </h2>
          <p className="mb-8 text-white/90">
            Réservez dès maintenant et laissez-nous vous faire découvrir les merveilles de la région.
          </p>
          <Button
            size="lg"
            className="bg-yellow-600 hover:bg-yellow-500"
            asChild
          >
            <Link to="/contact">
              Réservez votre séjour <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>

    </Layout>
  );
};

export default Services;
