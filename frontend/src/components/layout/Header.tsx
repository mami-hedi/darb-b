import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LogoDefault from "@/assets/LogoB&B.png";
import LogoScroll from "@/assets/LogoB&BBlanc.png";


const navigation = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Galerie", href: "/galerie" },
  { label: "Chambres", href: "/chambres" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white shadow-soft" : "bg-transparent"
      )}
    >
      <nav className="container-custom flex items-center justify-between py-5 relative">
        {/* Logo */}
           <Link to="/" className="relative z-50 flex items-center">
  {/* Logo affiché au top */}
  <img
    src={LogoScroll}
    alt="Dar B&B top"
    className={cn(
      "h-24 md:h-28 w-auto transition-opacity duration-300",
      scrolled ? "opacity-0" : "opacity-100"
    )}
  />

  {/* Logo après scroll */}
  <img
    src={LogoDefault}
    alt="Dar B&B scroll"
    className={cn(
      "h-24 md:h-28 w-auto absolute transition-opacity duration-300",
      scrolled ? "opacity-100" : "opacity-0"
    )}
  />
</Link>




        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                scrolled
                  ? "text-foreground hover:text-yellow-600"
                  : "text-white hover:text-yellow-400",
                location.pathname === item.href && "text-yellow-600"
              )}
            >
              {item.label}
            </Link>
          ))}

          <Button
            asChild
            size="sm"
            className="bg-yellow-600 text-white hover:bg-yellow-500"
          >
            <Link to="/disponibilite">Recherche Disponibilité</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className={cn("md:hidden z-50", scrolled ? "text-foreground" : "text-white")}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden z-40">
            <div className="flex flex-col items-start p-6 gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-base font-medium w-full py-2",
                    location.pathname === item.href
                      ? "text-yellow-600"
                      : "text-foreground hover:text-yellow-600"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <Button
                asChild
                size="sm"
                className="bg-yellow-600 text-white hover:bg-yellow-500 w-full mt-2"
              >
                <Link to="/disponibilite" onClick={() => setMobileMenuOpen(false)}>
                  Recherche Disponibilité
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
