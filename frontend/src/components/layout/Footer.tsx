import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0f2a44] text-white border-t border-white">
  <div className="container mx-auto px-6 lg:px-8 py-16">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-semibold">
              Dar B&B
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Une maison d'hôtes d'exception entre mer et montagne.
              Vivez une expérience unique d'hospitalité et de sérénité.
            </p>

            <div className="flex space-x-4 pt-2">
              <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
                <Instagram size={18} />
              </a>
              <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Navigation</h4>
            <nav className="flex flex-col space-y-2">
              {[
                { name: "Accueil", path: "/" },
                { name: "À propos", path: "/a-propos" },
                { name: "Galerie", path: "/galerie" },
                { name: "Chambres", path: "/chambres" },
                { name: "Services", path: "/services" },
                
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white/80 hover:text-yellow-400 transition text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-yellow-400 mt-0.5" />
                <span className="text-white/80">
                  Route de la Montagne, Vue Mer<br />
                  Tunisie
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-yellow-400" />
                <span className="text-white/80">
                  +216 XX XXX XXX
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-yellow-400" />
                <span className="text-white/80">
                  contact@darseif.com
                </span>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Horaires</h4>
            <div className="space-y-2 text-white/80 text-sm">
              <p>Check-in : 14h00 – 20h00</p>
              <p>Check-out : jusqu’à 11h00</p>
              <p className="pt-2">
                Réception disponible<br />
                7j/7 de 8h00 à 22h00
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/70 text-sm text-center">
  © {new Date().getFullYear()} Dar B&B. Tous droits réservés. Réalisé par{" "}
  <a
    href="https://www.mh-digital-solution.com"
    target="_blank"
    className="text-yellow-300 hover:text-yellow-500 transition-colors duration-300"
    rel="noopener noreferrer"
  >
    MH Digital Solution
  </a>
</p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
