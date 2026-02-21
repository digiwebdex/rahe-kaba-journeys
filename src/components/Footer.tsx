import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="RAHE KABA Logo" className="h-12 w-12 rounded-md object-cover" />
              <div>
                <span className="font-heading text-lg font-bold text-primary">RAHE KABA</span>
                <span className="block text-xs tracking-[0.2em] text-muted-foreground uppercase">Tours & Travels</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted partner for Hajj & Umrah from Chittagong, Bangladesh. Making sacred journeys seamless since 2010.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["Home", "Services", "Packages", "About", "Contact"].map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase()}`} className="hover:text-primary transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-primary">Services</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["Hajj Packages", "Umrah Packages", "Visa Processing", "Air Tickets", "Hotel Booking", "Ziyara Tours"].map((s) => (
                <li key={s}><span>{s}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +880 1601-505050</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> rahekaba.info@gmail.com</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary mt-0.5" /> Chittagong, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} RAHE KABA Tours & Travels. All rights reserved.</p>
          <p className="mt-2 text-xs text-muted-foreground/70">Design & Developed by <a href="https://digiwebdex.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">DigiWebDex</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
