import { motion } from "framer-motion";
import { Heart, Leaf, Sun, Award, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import exteriorImage from "@/assets/jar.jpg";
import loungeImage from "@/assets/lounge.jpg";
import landscapeImage from "@/assets/gallery/hero-main.jpg"; // hero image similaire accueil

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Hospitalité",
      description:
        "Un accueil chaleureux et personnalisé pour chaque hôte, dans la plus pure tradition tunisienne.",
    },
    {
      icon: Leaf,
      title: "Nature",
      description:
        "Un environnement préservé au cœur de la nature, entre mer et montagne.",
    },
    {
      icon: Sun,
      title: "Sérénité",
      description:
        "Un havre de paix où le temps s'arrête pour vous offrir repos et tranquillité.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "Des prestations de qualité et une attention particulière à chaque détail.",
    },
  ];

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
            À propos
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90">
            Découvrez l'histoire et les valeurs de Dar B&B
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 bg-background">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-yellow-600 uppercase text-sm mb-4">Notre histoire</p>
            <h2 className="font-display text-4xl font-semibold mb-6">
              Un rêve devenu réalité
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                <b>Dar B&B </b>est née d'une passion pour l'hospitalité et d'un amour profond
                pour cette région unique où la mer rencontre la montagne. Notre maison
                d'hôtes a été créée avec une vision claire : offrir à nos visiteurs
                une expérience authentique et inoubliable.
              </p>
              <p>
                Perchée sur les hauteurs, notre demeure offre des vues panoramiques
                époustouflantes sur la Méditerranée et les montagnes environnantes.
                Chaque chambre a été conçue pour capturer cette beauté naturelle
                tout en offrant le confort moderne.
              </p>
              <p>
                Aujourd'hui, <b>Dar B&B </b> est devenue une destination prisée des voyageurs
                en quête de calme, de beauté et d'authenticité.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img
              src={exteriorImage}
              alt="Extérieur de Dar Seif"
              className="rounded-xl shadow-medium w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 bg-secondary">
        <div className="container-custom text-center">
          <h2 className="font-display text-4xl font-semibold mb-6">Nos valeurs</h2>
          <p className="text-muted-foreground mb-12">
            Des valeurs authentiques qui guident chacune de nos actions pour vous offrir le meilleur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-white p-8 rounded-xl shadow-soft text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-6">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="py-24 bg-background">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={loungeImage}
              alt="Salon de Dar Seif"
              className="rounded-xl shadow-medium w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-yellow-600 uppercase text-sm mb-4">L'expérience</p>
            <h2 className="font-display text-4xl font-semibold mb-6">
              Bien plus qu'un séjour
            </h2>
            <p className="text-muted-foreground mb-4">
              À <b>Dar B&B </b>, nous croyons que les vacances doivent être une expérience
              transformatrice. C'est pourquoi nous avons créé un environnement où
              vous pouvez véritablement vous déconnecter et vous ressourcer.
            </p>
            <p className="text-muted-foreground mb-4">
              Que vous souhaitiez vous détendre sur notre terrasse avec vue sur la mer,
              explorer les sentiers de montagne environnants, ou simplement profiter
              du silence et de la beauté de la nature, nous sommes là pour rendre
              votre séjour parfait.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="font-display text-3xl font-semibold text-primary mb-1">5+</div>
                <div className="text-muted-foreground text-sm">Années d'expérience</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="font-display text-3xl font-semibold text-primary mb-1">1000+</div>
                <div className="text-muted-foreground text-sm">Hôtes accueillis</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Users className="mx-auto mb-4 w-12 h-12 text-white/80" />
            <h2 className="font-display text-4xl font-semibold mb-4">
              Une équipe passionnée
            </h2>
            <p className="text-white/80 max-w-3xl mx-auto">
              Notre équipe dévouée est là pour vous accueillir et vous accompagner
              tout au long de votre séjour. Avec une connaissance approfondie de la région
              et un souci constant du détail, nous nous efforçons de rendre chaque moment
              spécial. Bienvenue chez vous, bienvenue à <b>Dar B&B </b>.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
