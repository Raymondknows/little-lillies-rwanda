"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LANGUAGE_LOCALES, normalizeLanguage, type SupportedLanguage } from "@/lib/language";

const LANGUAGE_STORAGE_KEY = "schoolbase-language";

export type TranslationKey =
  | "overview" | "dashboard" | "students" | "fees" | "classes" | "teachers" | "subjects"
  | "results" | "admissions" | "promotions" | "analytics" | "attendance" | "whatsapp"
  | "support" | "announcements" | "subscription" | "settings" | "signOut" | "invoice"
  | "invoiceNo" | "paid" | "partPaid" | "outstanding" | "billTo" | "invoiceDetails"
  | "date" | "due" | "status" | "currency" | "onDemand" | "total" | "amountPaid"
  | "balance" | "outstandingBalance" | "totalPaid" | "saveSettings" | "systemLanguage"
  | "outstandingFees" | "activePupils" | "recentPayments" | "latestTransactions" | "quickActions" | "startGuide" | "latestStudents" | "latestTeachers" | "latestAnnouncements" | "viewAll" | "noPayments" | "noNewStudents" | "noRecentTeachers" | "noAnnouncements";
  

const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    overview: "Overview", dashboard: "Dashboard", students: "Students", fees: "Fees", classes: "Classes", teachers: "Teachers", subjects: "Subjects", results: "Results", admissions: "Admissions", promotions: "Promotions", analytics: "Analytics", attendance: "Attendance", whatsapp: "WhatsApp", support: "Support", announcements: "Announcements", subscription: "Subscription", settings: "Settings", signOut: "Sign out", invoice: "Invoice", invoiceNo: "Invoice No.", paid: "Paid", partPaid: "Part Paid", outstanding: "Outstanding", billTo: "Bill To", invoiceDetails: "Invoice Details", date: "Date", due: "Due", status: "Status", currency: "Currency", onDemand: "On Demand", total: "Total", amountPaid: "Amount Paid", balance: "Balance", outstandingBalance: "Outstanding Balance", totalPaid: "Total Paid", saveSettings: "Save Settings", systemLanguage: "System language", outstandingFees: "Outstanding fees", activePupils: "Active pupils", recentPayments: "Recent payments", latestTransactions: "Latest transactions", quickActions: "Quick actions", startGuide: "Start guide", latestStudents: "Latest students", latestTeachers: "Latest teachers", latestAnnouncements: "Latest announcements", viewAll: "View all", noPayments: "No payments yet.", noNewStudents: "No new students yet.", noRecentTeachers: "No recent teachers yet.", noAnnouncements: "No announcements yet.",
  },
  rw: {
    overview: "Incamake", dashboard: "Ikibaho", students: "Abanyeshuri", fees: "Amafaranga", classes: "Amashuri", teachers: "Abarimu", subjects: "Amasomo", results: "Amanota", admissions: "Kwakira abanyeshuri", promotions: "Kuzamura abanyeshuri", analytics: "Isesengura", attendance: "Abitabiriye", whatsapp: "WhatsApp", support: "Ubufasha", announcements: "Amatangazo", subscription: "Kwiyandikisha", settings: "Igenamiterere", signOut: "Sohoka", invoice: "Inyemezabwishyu", invoiceNo: "Nimero y'inyemezabwishyu", paid: "Yishyuwe", partPaid: "Yishyuwe igice", outstanding: "Ntibirishyurwa", billTo: "Yishyurirwa na", invoiceDetails: "Ibisobanuro by'inyemezabwishyu", date: "Itariki", due: "Itariki ntarengwa", status: "Imiterere", currency: "Ifaranga", onDemand: "Bisabwe", total: "Igiteranyo", amountPaid: "Amafaranga yishyuwe", balance: "Asigaye", outstandingBalance: "Asigaye kwishyura", totalPaid: "Igiteranyo cyishyuwe", saveSettings: "Bika igenamiterere", systemLanguage: "Ururimi rwa sisitemu", outstandingFees: "Amafaranga atishyuwe", activePupils: "Abanyeshuri bakora", recentPayments: "Ubwishyu buheruka", latestTransactions: "Ibikorwa biheruka", quickActions: "Ibikorwa byihuse", startGuide: "Tangira kuyobora", latestStudents: "Abanyeshuri bashya", latestTeachers: "Abarimu bashya", latestAnnouncements: "Amatangazo mashya", viewAll: "Reba byose", noPayments: "Nta bwishyu buraboneka.", noNewStudents: "Nta banyeshuri bashya.", noRecentTeachers: "Nta barimu bashya.", noAnnouncements: "Nta matangazo.",
  },
  fr: {
    overview: "Vue d'ensemble", dashboard: "Tableau de bord", students: "Élèves", fees: "Frais", classes: "Classes", teachers: "Enseignants", subjects: "Matières", results: "Résultats", admissions: "Admissions", promotions: "Promotions", analytics: "Analyses", attendance: "Présence", whatsapp: "WhatsApp", support: "Assistance", announcements: "Annonces", subscription: "Abonnement", settings: "Paramètres", signOut: "Se déconnecter", invoice: "Facture", invoiceNo: "N° de facture", paid: "Payée", partPaid: "Partiellement payée", outstanding: "Impayée", billTo: "Facturée à", invoiceDetails: "Détails de la facture", date: "Date", due: "Échéance", status: "Statut", currency: "Devise", onDemand: "À la demande", total: "Total", amountPaid: "Montant payé", balance: "Solde", outstandingBalance: "Solde impayé", totalPaid: "Total payé", saveSettings: "Enregistrer les paramètres", systemLanguage: "Langue du système", outstandingFees: "Frais impayés", activePupils: "Élèves actifs", recentPayments: "Paiements récents", latestTransactions: "Dernières transactions", quickActions: "Actions rapides", startGuide: "Démarrer le guide", latestStudents: "Derniers élèves", latestTeachers: "Derniers enseignants", latestAnnouncements: "Dernières annonces", viewAll: "Voir tout", noPayments: "Aucun paiement.", noNewStudents: "Aucun nouvel élève.", noRecentTeachers: "Aucun enseignant récent.", noAnnouncements: "Aucune annonce.",
  },
  sw: {
    overview: "Muhtasari", dashboard: "Dashibodi", students: "Wanafunzi", fees: "Ada", classes: "Madarasa", teachers: "Walimu", subjects: "Masomo", results: "Matokeo", admissions: "Udahili", promotions: "Uhamisho", analytics: "Uchambuzi", attendance: "Mahudhurio", whatsapp: "WhatsApp", support: "Msaada", announcements: "Matangazo", subscription: "Usajili", settings: "Mipangilio", signOut: "Ondoka", invoice: "Ankara", invoiceNo: "Nambari ya ankara", paid: "Imelipwa", partPaid: "Imelipwa sehemu", outstanding: "Haijalipwa", billTo: "Ankara kwa", invoiceDetails: "Maelezo ya ankara", date: "Tarehe", due: "Tarehe ya mwisho", status: "Hali", currency: "Sarafu", onDemand: "Kwa ombi", total: "Jumla", amountPaid: "Kiasi kilicholipwa", balance: "Salio", outstandingBalance: "Salio linalodaiwa", totalPaid: "Jumla iliyolipwa", saveSettings: "Hifadhi mipangilio", systemLanguage: "Lugha ya mfumo", outstandingFees: "Ada ambazo hazijalipwa", activePupils: "Wanafunzi wanaofanya kazi", recentPayments: "Malipo ya hivi karibuni", latestTransactions: "Miamala ya hivi karibuni", quickActions: "Vitendo vya haraka", startGuide: "Anza mwongozo", latestStudents: "Wanafunzi wa hivi karibuni", latestTeachers: "Walimu wa hivi karibuni", latestAnnouncements: "Matangazo ya hivi karibuni", viewAll: "Ona yote", noPayments: "Hakuna malipo bado.", noNewStudents: "Hakuna wanafunzi wapya.", noRecentTeachers: "Hakuna walimu wa hivi karibuni.", noAnnouncements: "Hakuna matangazo.",
  },
};

type LanguageContextValue = {
  language: SupportedLanguage;
  locale: string;
  t: (key: TranslationKey) => string;
  translateText: (text: string) => string;
  setLanguage: (language: SupportedLanguage) => void;
};

const textKeys: Partial<Record<string, TranslationKey>> = {
  Overview: "overview", Dashboard: "dashboard", Students: "students", Fees: "fees", Classes: "classes", Teachers: "teachers", Subjects: "subjects", Results: "results", Admissions: "admissions", Promotions: "promotions", Analytics: "analytics", Attendance: "attendance", "Attendance Overview": "attendance", WhatsApp: "whatsapp", Support: "support", Announcements: "announcements", Subscription: "subscription", "Your Subscription": "subscription", Settings: "settings", Invoice: "invoice", "Invoice No.": "invoiceNo", "Bill To": "billTo", "Invoice Details": "invoiceDetails", Status: "status", Currency: "currency", Date: "date", Due: "due", "Amount Paid": "amountPaid", "Outstanding Balance": "outstandingBalance", "Total Paid": "totalPaid", "Save Settings": "saveSettings", "System language": "systemLanguage",
};

const phraseTranslations: Record<SupportedLanguage, Record<string, string>> = {
  en: {},
  rw: {
    "Fees & Invoices": "Amafaranga n'inyemezabwishyu",
    "Manage student invoices and track fee payments by phase, term, and class": "Genzura inyemezabwishyu z'abanyeshuri n'ubwishyu",
    Student: "Umunyeshuri",
    "Payment Method": "Uburyo bwo kwishyura",
    "Reference (optional)": "Inyandiko (si ngombwa)",
    "Search Fees": "Shakisha amafaranga",
    "Close Search": "Funga ubushakashatsi",
    "Issue Bills": "Tanga inyemezabwishyu",
    "Send Reminders": "Ohereza ibyibutsa",
    "Fee Schedules": "Gahunda z'amafaranga",
    "School Phase:": "Icyiciro cy'ishuri:",
    "Phase / Class": "Icyiciro / Ishuri",
    Term: "Igihembwe",
    "Amount Due": "Amafaranga asabwa",
    Actions: "Ibikorwa",
    View: "Reba",
    Remind: "Ibutsa",
    Pay: "Yishyura",
    "Record payment": "Andika ubwishyu",
    "Record Payment": "Andika ubwishyu",
    Cancel: "Hagarika",
    "Rows per page": "Imirongo kuri paji",
    "Partial payments recorded": "Ubwishyu bw'igice bwanditswe",
    overdue: "byarengeje igihe",
    "fully paid": "byishyuwe byose",
    "No invoices to display": "Nta nyemezabwishyu zo kwerekana",
    invoice: "inyemezabwishyu",
    invoices: "inyemezabwishyu",
    "Attendance Overview": "Ubuzimantare bw'abitabiriye",
    Present: "Baje",
    Absent: "Ntibaaje",
    Late: "Baje nubwo byarengeje igihe",
    "Open records": "Fungura inyandiko",
    "Export CSV": "Gushyiraho CSV",
    "Export PDF": "Gushyiraho PDF",
    "Print": "Shyirwa bisiga",
    "Present rate snapshot": "Ubuzimantare bw'abaje",
    "Manage attendance records, review performance, and export reporting from one place.": "Genzura inyandiko y'abitabiriye, shukisha imibare, no gushyiraho raporo.",
    "Draft": "Sisitemu",
    "Published": "Yashyikiwe",
    "Ready to Publish": "Yiteganyeje gushyikiwa",
    "Add result": "Ongereza isesengura",
    "Edit": "Guhindura",
    "Delete": "Gusiba",
    "View broadsheet": "Reba icyiciro cy'amanota",
    "No results found": "Nta manota.",
    "Students": "Abanyeshuri",
    "Add student": "Ongereza umunyeshuri",
    "Search Students": "Shakisha abanyeshuri",
    "Search Student": "Shakisha umunyeshuri",
    "Search by name or admission number...": "Shakisha izina cyangwa nimero y'amakuru...",
    "Admission No.": "Nimero y'amakuru",
    "First Name": "Izina ryambere",
    "Last Name": "Izina ryanyuma",
    "Early Years": "Igihe cy'iyandikira",
    "Primary": "Inzira y'amashuri",
    "Secondary": "Inzira y'amashuri y'ikirevu",
    "All Students": "Abanyeshuri bose",
    "No students found": "Nta banyeshuri.",
    "No students found matching": "Nta banyeshuri bavakiranye na",
    "No students": "Nta banyeshuri",
    "in this phase": "muri iki cyiciro",
    "Active": "Akora",
    "Class": "Ishuri",
    "Phone": "Telepiyoni",
    "Email": "Imeyili",
    "Add New": "Ongereza rishya",
    "Manage Students": "Genzura abanyeshuri",
    "Restore inactive": "Ongeza abanyeshuri batirikoze",
    "Restore inactive students": "Ongeza abanyeshuri batirikoze",
    "Import CSV": "Kuziga CSV",
    "WhatsApp connected": "WhatsApp ifitanye isano",
    "WhatsApp disconnected": "WhatsApp idafitanye isano",
    "Ready to send school messages.": "Yiteguye kohereza ubutumwa bw'ishuri.",
    "Reconnect via settings.": "Subiramo ukoresheje igenamiterere.",
    "Roster updated successfully": "Urutonde rwaravuguruwe neza",
    "Student saved successfully": "Umunyeshuri yabitswe neza",
    "Close": "Funga",
    "Back to roster": "Subira ku rutonde",
    "Student registered, but guardian email failed to send.": "Umunyeshuri yanditswe, ariko imeri y'umurinzi itaroherejwe.",
    "Please verify the guardian's email address and SMTP settings. The student record was still created.": "Nyamuneka menya imeri y'umurinzi n'igenamiterere rya SMTP. Icyandiko cy'umunyeshuri cyakomeje kubakwa.",
    "Sort": "Sorti",
    "Starts with": "Tangira na",
    "Rows": "Imirongo",
    "All classes": "Ishuri ryose",
    "All": "Byose",
    "Showing": "Kwerekana",
    "of": "ku",
    "matching": "bihuye na",
    "selected": "byatoranijwe",
    "Remove": "Gukuraho",
    "Reset": "Gusubiramo",
    "Photo": "Ifoto",
    "Name": "Izina",
    "Parent Contact": "Umutangazamakuru w'uhamya",
    "Action": "Igihe",
    "Previous": "Ibanza",
    "Next": "Ikurikira",
    "Select visible students": "Hitamo abanyeshuri babonwa",
    "Select records to return to the active roster. Admission numbers are not automatically changed.": "Hitamo inyandiko zo kugarura ku rutonde rukora. Nimero y'amakuru ntabwo ihinduka byikora."
  },
  fr: {
    "Fees & Invoices": "Frais et factures",
    "Manage student invoices and track fee payments by phase, term, and class": "Gérer les factures des élèves et suivre les paiements",
    Student: "Élève",
    "Payment Method": "Mode de paiement",
    "Reference (optional)": "Référence (facultatif)",
    "Search Fees": "Rechercher les frais",
    "Close Search": "Fermer la recherche",
    "Issue Bills": "Émettre les factures",
    "Send Reminders": "Envoyer des rappels",
    "Fee Schedules": "Barèmes des frais",
    "School Phase:": "Phase scolaire :",
    "Phase / Class": "Phase / Classe",
    Term: "Période",
    "Amount Due": "Montant dû",
    Actions: "Actions",
    View: "Voir",
    Remind: "Rappeler",
    Pay: "Payer",
    "Record payment": "Enregistrer le paiement",
    "Record Payment": "Enregistrer le paiement",
    Cancel: "Annuler",
    "Rows per page": "Lignes par page",
    "Partial payments recorded": "Paiements partiels enregistrés",
    overdue: "en retard",
    "fully paid": "entièrement payées",
    "No invoices to display": "Aucune facture à afficher",
    invoice: "facture",
    invoices: "factures",
    "Attendance Overview": "Aperçu de la présence",
    Present: "Présent",
    Absent: "Absent",
    Late: "En retard",
    "Open records": "Ouvrir les registres",
    "Export CSV": "Exporter CSV",
    "Export PDF": "Exporter PDF",
    "Print": "Imprimer",
    "Present rate snapshot": "Aperçu du taux de présence",
    "Manage attendance records, review performance, and export reporting from one place.": "Gérer les registres de présence, examiner les performances et exporter les rapports.",
    "Draft": "Brouillon",
    "Published": "Publié",
    "Ready to Publish": "Prêt à publier",
    "Add result": "Ajouter un résultat",
    "Edit": "Modifier",
    "Delete": "Supprimer",
    "View broadsheet": "Afficher le tableau de bord",
    "No results found": "Aucun résultat trouvé.",
    "Students": "Élèves",
    "Add student": "Ajouter un élève",
    "Search Students": "Rechercher des élèves",
    "Search Student": "Rechercher un élève",
    "Search by name or admission number...": "Rechercher par nom ou numéro d'admission...",
    "Admission No.": "N° d'admission",
    "First Name": "Prénom",
    "Last Name": "Nom de famille",
    "Early Years": "Maternelle",
    "Primary": "Primaire",
    "Secondary": "Secondaire",
    "All Students": "Tous les élèves",
    "No students found": "Aucun élève trouvé.",
    "No students found matching": "Aucun élève ne correspond à",
    "No students": "Aucun élève",
    "in this phase": "dans cette phase",
    "Active": "Actif",
    "Class": "Classe",
    "Phone": "Téléphone",
    "Email": "E-mail",
    "Add New": "Ajouter nouveau",
    "Manage Students": "Gérer les élèves",
    "Restore inactive": "Restaurer les inactifs",
    "Restore inactive students": "Restaurer les élèves inactifs",
    "Import CSV": "Importer CSV",
    "WhatsApp connected": "WhatsApp connecté",
    "WhatsApp disconnected": "WhatsApp déconnecté",
    "Ready to send school messages.": "Prêt à envoyer des messages scolaires.",
    "Reconnect via settings.": "Reconnectez-vous depuis les paramètres.",
    "Roster updated successfully": "Liste mise à jour",
    "Student saved successfully": "Élève enregistré avec succès",
    "Close": "Fermer",
    "Back to roster": "Retour à la liste",
    "Student registered, but guardian email failed to send.": "L'élève a été enregistré, mais l'e-mail du parent n'a pas été envoyé.",
    "Please verify the guardian's email address and SMTP settings. The student record was still created.": "Vérifiez l'adresse e-mail du parent et les paramètres SMTP. Le dossier de l'élève a tout de même été créé.",
    "Sort": "Trier",
    "Starts with": "Commence par",
    "Rows": "Lignes",
    "All classes": "Toutes les classes",
    "All": "Tout",
    "Showing": "Affichage",
    "of": "sur",
    "matching": "correspondant à",
    "selected": "sélectionné(s)",
    "Remove": "Retirer",
    "Reset": "Réinitialiser",
    "Photo": "Photo",
    "Name": "Nom",
    "Parent Contact": "Contact parent",
    "Action": "Action",
    "Previous": "Précédent",
    "Next": "Suivant",
    "Select visible students": "Sélectionner les élèves visibles",
    "Select records to return to the active roster. Admission numbers are not automatically changed.": "Sélectionnez les dossiers à remettre dans la liste active. Les numéros d'admission ne sont pas modifiés automatiquement."
  },
  sw: {
    "Fees & Invoices": "Ada na Ankara",
    "Manage student invoices and track fee payments by phase, term, and class": "Simamia ankara za wanafunzi na fuatilia malipo",
    Student: "Mwanafunzi",
    "Payment Method": "Njia ya malipo",
    "Reference (optional)": "Rejeleo (si lazima)",
    "Search Fees": "Tafuta ada",
    "Close Search": "Funga utafutaji",
    "Issue Bills": "Toa ankara",
    "Send Reminders": "Tuma vikumbusho",
    "Fee Schedules": "Ratiba za ada",
    "School Phase:": "Awamu ya shule:",
    "Phase / Class": "Awamu / Darasa",
    Term: "Muhula",
    "Amount Due": "Kiasi kinachodaiwa",
    Actions: "Vitendo",
    View: "Tazama",
    Remind: "Kumbusha",
    Pay: "Lipa",
    "Record payment": "Rekodi malipo",
    "Record Payment": "Rekodi malipo",
    Cancel: "Ghairi",
    "Rows per page": "Safu kwa ukurasa",
    "Partial payments recorded": "Malipo ya sehemu yamerekodiwa",
    overdue: "yamechelewa",
    "fully paid": "yamelipwa yote",
    "No invoices to display": "Hakuna ankara za kuonyesha",
    invoice: "ankara",
    invoices: "ankara",
    "Attendance Overview": "Muhtasari wa Mahudhurio",
    Present: "Yupo",
    Absent: "Hayupo",
    Late: "Kuchelewa",
    "Open records": "Fungua rekodi",
    "Export CSV": "Hamisha CSV",
    "Export PDF": "Hamisha PDF",
    "Print": "Chapisha",
    "Present rate snapshot": "Picha ya Asilimia ya Mahudhurio",
    "Manage attendance records, review performance, and export reporting from one place.": "Simamia rekodi za mahudhurio, kagua utendaji, na hamisha ripoti.",
    "Draft": "Rasimu",
    "Published": "Imechapishwa",
    "Ready to Publish": "Tayari kuchapishwa",
    "Add result": "Ongeza matokeo",
    "Edit": "Badilisha",
    "Delete": "Futa",
    "View broadsheet": "Tazama karatasi ya matokeo",
    "No results found": "Hakuna matokeo yaliyopatikana.",
    "Students": "Wanafunzi",
    "Add student": "Ongeza mwanafunzi",
    "Search Students": "Tafuta wanafunzi",
    "Search Student": "Tafuta mwanafunzi",
    "Search by name or admission number...": "Tafuta kwa jina au nambari ya udahili...",
    "Admission No.": "Nambari ya udahili",
    "First Name": "Jina la kwanza",
    "Last Name": "Jina la mwisho",
    "Early Years": "Maenzi",
    "Primary": "Msingi",
    "Secondary": "Sekondari",
    "All Students": "Wanafunzi wote",
    "No students found": "Hakuna wanafunzi.",
    "No students found matching": "Hakuna wanafunzi yanayolingana na",
    "No students": "Hakuna wanafunzi",
    "in this phase": "katika awamu hii",
    "Active": "Amilifu",
    "Class": "Darasa",
    "Phone": "Simu",
    "Email": "Baruapepe",
    "Add New": "Ongeza mpya",
    "Manage Students": "Simamia wanafunzi",
    "Restore inactive": "Kamata makubwa",
    "Restore inactive students": "Kamata wanafunzi ambaao hawajafanya kazi",
    "Import CSV": "Ingiza CSV",
    "WhatsApp connected": "WhatsApp imeunganishwa",
    "WhatsApp disconnected": "WhatsApp imetengana",
    "Ready to send school messages.": "Tayari kutuma ujumbe wa shule.",
    "Reconnect via settings.": "Unganisha tena kupitia mipangilio.",
    "Roster updated successfully": "Orodha imesasishwa kwa mafanikio",
    "Student saved successfully": "Mwanafunzi ameokolewa kwa mafanikio",
    "Close": "Funga",
    "Back to roster": "Rudi kwenye orodha",
    "Student registered, but guardian email failed to send.": "Mwanafunzi amesajiliwa, lakini barua pepe ya mlezi haikutumwa.",
    "Please verify the guardian's email address and SMTP settings. The student record was still created.": "Tafadhali thibitisha anwani ya barua pepe ya mlezi na mipangilio ya SMTP. Rekodi ya mwanafunzi iliundwa bado.",
    "Sort": "Panga",
    "Starts with": "Anza na",
    "Rows": "Safu",
    "All classes": "Madarasa yote",
    "All": "Yote",
    "Showing": "Inaonyesha",
    "of": "ya",
    "matching": "inayolingana na",
    "selected": "yamechaguliwa",
    "Remove": "Ondoa",
    "Reset": "Weka upya",
    "Photo": "Picha",
    "Name": "Jina",
    "Parent Contact": "Mawasiliano ya mzazi",
    "Action": "Kitendo",
    "Previous": "Iliyotangulia",
    "Next": "Ifuatayo",
    "Select visible students": "Chagua wanafunzi wanaoonekana",
    "Select records to return to the active roster. Admission numbers are not automatically changed.": "Chagua rekodi za kurudisha kwenye orodha inayofanya kazi. Nambari za udahili hazibadiliki kiotomatiki."
  },
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) setLanguageState(normalizeLanguage(stored));

    if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/schoolbase-admin")) {
      fetch("/api/admin/settings/data", { credentials: "include" })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => {
          const saved = normalizeLanguage(data?.config?.preferredLanguage);
          setLanguageState(saved);
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, saved);
        })
        .catch(() => undefined);
    }
  }, []);

  const setLanguage = (next: SupportedLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    document.documentElement.lang = next;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey) => translations[language][key];
  const translateText = (text: string) => {
    if (phraseTranslations[language][text.trim()]) return phraseTranslations[language][text.trim()];
    const key = textKeys[text.trim()];
    return key ? t(key) : text;
  };

  return <LanguageContext.Provider value={{ language, locale: LANGUAGE_LOCALES[language], t, translateText, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
