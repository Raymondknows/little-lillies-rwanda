import Link from "next/link";
import { Linkedin, Facebook, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-bold text-lg">Little Lillies School</h3>
            <p className="mt-3 max-w-lg text-sm text-white/70">
              A warm, nurturing school community where every child grows in confidence, character, and academic excellence.
            </p>

            <div className="mt-5 flex gap-3">
              <a href="https://www.linkedin.com/company/106371744/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://web.facebook.com/profile.php?id=61577572757498" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="mailto:littlelillies82@gmail.com" className="text-white/70 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://wa.me/2349031368963" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4 text-sm text-white/80">
            <div>
              <h4 className="font-semibold text-white">Contact</h4>
              <p>
                <a href="mailto:littlelillies82@gmail.com" className="hover:text-white">
                  littlelillies82@gmail.com
                </a>
              </p>
              <p>
                <a href="tel:+234781464730" className="hover:text-white">
                  0781464730
                </a>
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white">Location</h4>
              <p className="mt-2 max-w-md">
                Rugarama village, Nyabisindu Cell, Remera Sector, Gasabo District (KG 8 AVE HOUSE 98), KIGALI, RWANDA
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/70">
          <p>© {new Date().getFullYear()} Little Lillies School. All rights reserved.</p>
          <p className="mt-3">
            Powered by{" "}
            <a href="https://www.schoolbase.live" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand transition">
              SchoolBase
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
