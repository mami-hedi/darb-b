import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

import { X, ChevronLeft, ChevronRight } from "lucide-react";

import heroImage from "@/assets/hero-main.jpg";
import room1 from "@/assets/room-1.jpg";
import room2 from "@/assets/room-2.jpg";
import room3 from "@/assets/room-3.jpg";
import breakfastImage from "@/assets/breakfast.jpg";
import landscapeImage from "@/assets/landscape.jpg";
import exteriorImage from "@/assets/exterior.jpg";
import loungeImage from "@/assets/lounge.jpg";
import sp1 from "@/assets/sp1.jpg";
import s2 from "@/assets/s2.jpg";
import s3 from "@/assets/s3.jpg";
import jar from "@/assets/jar.jpg";

const galleryImages = [
  { src: heroImage, alt: "Terrasse avec vue mer et montagne", category: "Extérieur" },
  { src: room1, alt: "Chambre Azur - Vue mer", category: "Chambres" },
  { src: room2, alt: "Chambre Montagne", category: "Chambres" },
  { src: room3, alt: "Suite Panoramique", category: "Chambres" },
  { src: s2, alt: "Suite Panoramique", category: "Chambres" },
  { src: s3, alt: "Suite Panoramique", category: "Chambres" },
  { src: breakfastImage, alt: "Petit-déjeuner sur la terrasse", category: "Gastronomie" },
  { src: landscapeImage, alt: "Vue panoramique mer et montagne", category: "Paysages" },
  { src: exteriorImage, alt: "Façade de Dar Seif", category: "Extérieur" },
  { src: jar, alt: "Jardin et piscine", category: "Extérieur" },
  { src: loungeImage, alt: "Salon avec vue sur la mer", category: "Intérieur" },
  { src: sp1, alt: "Salle d'eau", category: "Intérieur" },
];

const categories = ["Tout", "Chambres", "Extérieur", "Intérieur", "Paysages", "Gastronomie"];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("Tout");

  const filteredImages =
    activeCategory === "Tout"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const handlePrev = () => {
    if (selectedImage !== null) {
      const prevIndex = selectedImage > 0 ? selectedImage - 1 : filteredImages.length - 1;
      setSelectedImage(prevIndex);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      const nextIndex = selectedImage < filteredImages.length - 1 ? selectedImage + 1 : 0;
      setSelectedImage(nextIndex);
    }
  };

  return (
    <Layout>
      {/* HERO */}
      <section
        className="relative h-[50vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${landscapeImage})`, backgroundSize: "cover" }}
      >
        <div className="absolute inset-0 bg-[#0f2a44]/75" />
        <div className="relative z-10 text-center text-white container-custom">
          <h1 className="font-display text-5xl md:text-6xl font-semibold mb-4">Galerie</h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90">
            Découvrez Dar B&B en images & vidéos
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-sm text-accent">{image.category}</span>
                    <h3 className="text-primary-foreground font-medium">{image.alt}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-primary-foreground hover:text-accent transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-primary-foreground hover:text-accent transition-colors text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              ‹
            </button>

            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={filteredImages[selectedImage]?.src}
              alt={filteredImages[selectedImage]?.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-primary-foreground hover:text-accent transition-colors text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              ›
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <span className="text-sm text-accent">{filteredImages[selectedImage]?.category}</span>
              <h3 className="text-primary-foreground font-display text-lg">
                {filteredImages[selectedImage]?.alt}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
     
{/* Video Section */}
<section className="section-padding bg-gray-100">
  <div className="container-custom text-center">
    <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6 text-foreground">
      Découvrez Dar B&B en vidéo
    </h2>
    <p className="font-body text-muted-foreground mb-8 max-w-2xl mx-auto">
      Plongez dans l’ambiance unique de notre maison d’hôtes et de sa région.
    </p>

    <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg">
      <iframe
        src="https://www.youtube.com/embed/NAbcsYvSi3k"
        title="Vidéo Dar Seif"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
</section>

    </Layout>
  );
};

export default Gallery;
