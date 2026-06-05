import Link from "next/link";
import { Linkedin, Facebook, Mail, Phone, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-5">
          {/* Brand & Social */}
          <div className="md:col-span-1">
            <h3 className="font-bold text-lg mb-4">SchoolBase</h3>
            <p className="text-sm text-white/70 mb-6">
              Complete school management platform. Built by ClickBase Technologies Ltd.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/106371744/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://web.facebook.com/profile.php?id=61577572757498"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@schoolbase.clickbasegroup.com"
                className="text-white/70 hover:text-white"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/2349031368963"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/solutions/school-fee-management"
                  className="text-white/70 hover:text-white"
                >
                  Fee Management
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/digital-result-management"
                  className="text-white/70 hover:text-white"
                >
                  Results Management
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/student-attendance-tracking"
                  className="text-white/70 hover:text-white"
                >
                  Attendance Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/parent-communication"
                  className="text-white/70 hover:text-white"
                >
                  Parent Communication
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/school-broadsheet"
                  className="text-white/70 hover:text-white"
                >
                  Broadsheet
                </Link>
              </li>
            </ul>
          </div>

          {/* Guides (High Authority) */}
          <div>
            <h4 className="font-semibold mb-4">Learning Guides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/guides/school-fee-management"
                  className="text-white/70 hover:text-white"
                >
                  Fee Management Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/digital-report-cards"
                  className="text-white/70 hover:text-white"
                >
                  Digital Report Cards
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/school-broadsheet"
                  className="text-white/70 hover:text-white"
                >
                  Broadsheet Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/digital-transformation"
                  className="text-white/70 hover:text-white"
                >
                  Digital Transformation
                </Link>
              </li>
              <li>
                <Link
                  href="/video-tutorials"
                  className="text-white/70 hover:text-white"
                >
                  Video Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h4 className="font-semibold mb-4">Geographic</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/ghana-school-software"
                  className="text-white/70 hover:text-white"
                >
                  🇬🇭 Ghana (GHS 500)
                </Link>
              </li>
              <li>
                <Link
                  href="/nigeria-school-software"
                  className="text-white/70 hover:text-white"
                >
                  🇳🇬 Nigeria (₦35k)
                </Link>
              </li>
              <li>
                <Link
                  href="/kenya-school-software"
                  className="text-white/70 hover:text-white"
                >
                  🇰🇪 Kenya (KES 4k)
                </Link>
              </li>
              <li>
                <Link
                  href="/uganda-school-software"
                  className="text-white/70 hover:text-white"
                >
                  🇺🇬 Uganda (UGX 150k)
                </Link>
              </li>
            </ul>
          </div>

          {/* ClickBase Ecosystem */}
          <div>
            <h4 className="font-semibold mb-4">ClickBase Ecosystem</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://clickbasegroup.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white"
                >
                  ClickBase Group
                </a>
              </li>
              <li>
                <a
                  href="https://clickinvoice.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white"
                >
                  ClickInvoice
                </a>
              </li>
              <li>
                <a
                  href="https://tradebase.live/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white"
                >
                  TradeBase AI
                </a>
              </li>
              <li>
                <Link
                  href="/founder"
                  className="text-white/70 hover:text-white font-semibold"
                >
                  Founder
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="grid gap-6 md:grid-cols-3 text-sm text-white/70 mb-8">
            {/* Comparison Links (SEO) */}
            <div>
              <p className="font-semibold text-white mb-2">Compare</p>
              <div className="space-y-1">
                <Link
                  href="/compare/manual-systems"
                  className="block hover:text-white"
                >
                  vs Manual Systems
                </Link>
                <Link href="/compare/edumis" className="block hover:text-white">
                  vs EduMIS
                </Link>
                <Link href="/compare/free-vs-paid" className="block hover:text-white">
                  Free vs Paid
                </Link>
              </div>
            </div>

            {/* Role Pages (Segmentation) */}
            <div>
              <p className="font-semibold text-white mb-2">For Your Role</p>
              <div className="space-y-1">
                <Link href="/for-principals" className="block hover:text-white">
                  Principals
                </Link>
                <Link href="/for-bursars" className="block hover:text-white">
                  Bursars
                </Link>
                <Link href="/for-teachers" className="block hover:text-white">
                  Teachers
                </Link>
                <Link href="/for-parents" className="block hover:text-white">
                  Parents
                </Link>
              </div>
            </div>

            {/* Industries (Vertical Targeting) */}
            <div>
              <p className="font-semibold text-white mb-2">By School Type</p>
              <div className="space-y-1">
                <Link
                  href="/industries/secondary-schools"
                  className="block hover:text-white"
                >
                  Secondary Schools
                </Link>
                <Link
                  href="/industries/early-childhood-centers"
                  className="block hover:text-white"
                >
                  Early Childhood
                </Link>
                <Link
                  href="/industries/international-schools"
                  className="block hover:text-white"
                >
                  International Schools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10 bg-black/30 py-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
            <div>
              <p>© 2026 SchoolBase. A ClickBase Group product.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms & Conditions
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact Support
              </Link>
            </div>
            <div className="text-right">
              <p>
                <a
                  href="tel:+2349031368963"
                  className="hover:text-white"
                >
                  +234 903 136 8963
                </a>
              </p>
              <p className="text-xs">Mon–Sat 8am–8pm WAT</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
