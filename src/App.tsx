import { useState, useEffect } from "react";
import { Compass, ShieldCheck, User, LogOut, Settings, Users, Star, ArrowRight } from "lucide-react";
import TravelerApp from "./components/TravelerApp";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeRole, setActiveRole] = useState<"traveler" | "admin">("traveler");
  const [loading, setLoading] = useState(false);

  const handleLogin = (role: "traveler" | "admin") => {
    setLoading(true);
    setTimeout(() => {
      setActiveRole(role);
      setIsLoggedIn(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-[#FDFCF9] min-h-screen text-[#2D2D24] flex flex-col font-sans" id="app-root">
      {!isLoggedIn ? (
        /* 1. Visually Polished Introduction / Login Screen */
        <div className="flex-1 flex items-center justify-center p-4 md:p-8" id="welcome-screen">
          <div className="max-w-md w-full bg-white rounded-[32px] border border-[#E5E2DD] p-8 shadow-md space-y-8 animate-fade-in text-center relative overflow-hidden" id="welcome-card">
            {/* Soft, professional accent shape */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#5A5A40] via-[#8C8C7A] to-[#D48C6F]"></div>

            <div className="space-y-3 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] shadow-inner mb-2" id="welcome-logo">
                <Compass className="w-9 h-9 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <span className="bg-[#D48C6F]/10 text-[#D48C6F] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                ✓ Trusted by 10,000+ senior travelers
              </span>
              <h1 className="text-4xl font-serif italic text-[#2D2D24] tracking-tight">Travel Buddy</h1>
              <p className="text-[#4A4A40] text-sm leading-relaxed max-w-xs mx-auto">
                Your wise, patient, and completely reliable companion for the journey ahead.
              </p>
            </div>

            {/* Testimonial Quote */}
            <div className="bg-[#F5F2ED] p-5 rounded-[24px] border border-[#E5E2DD] text-left space-y-2" id="welcome-quote">
              <p className="text-xs italic text-[#4A4A40] leading-relaxed">
                "Finding stays without staircases used to be an ordeal. Travel Buddy selected flat-level hotels and arranged accessible private cars easily."
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#2D2D24]">- Ramesh K., age 72</span>
                <div className="flex gap-0.5 text-[#D48C6F]">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                </div>
              </div>
            </div>

            {/* Tactical Login Options */}
            <div className="space-y-3 pt-2" id="welcome-ctas">
              <button
                disabled={loading}
                onClick={() => handleLogin("traveler")}
                className="w-full h-14 bg-[#5A5A40] hover:bg-[#43432F] text-white font-bold rounded-full flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all text-base"
              >
                {loading ? "Preparing your guide..." : "Plan & Explore as Traveler"} <ArrowRight className="w-5 h-5" />
              </button>

              <button
                disabled={loading}
                onClick={() => handleLogin("admin")}
                className="w-full h-14 bg-white border-2 border-[#E5E2DD] hover:border-[#5A5A40] text-[#2D2D24] font-bold rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
              >
                <Settings className="w-4 h-4 text-[#4A4A40]" /> Enter Admin Control Center
              </button>
            </div>

            <div className="text-[11px] text-[#8C8C7A] font-medium">
              Secured with premium healthcare and privacy safeguards.
            </div>
          </div>
        </div>
      ) : (
        /* 2. Logged In Full-Stack Application Shell */
        <div className="flex-1 flex flex-col" id="app-workspace">
          {/* Main Top Header Navigation */}
          <header className="bg-white border-b border-[#E5E2DD] px-6 py-4 sticky top-0 z-40 shadow-sm" id="main-header">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold shadow-sm">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif italic text-[#2D2D24] tracking-tight leading-none">Travel Buddy</h2>
                  <span className="text-[10px] text-[#8C8C7A] font-semibold">Senior Smart Travel Expert</span>
                </div>
              </div>

              {/* COHESIVE REAL-TIME ROLE SWITCHER BAR */}
              <div className="bg-[#F5F2ED] p-1 rounded-full border border-[#E5E2DD] flex shadow-inner" id="role-switcher-component">
                <button
                  onClick={() => setActiveRole("traveler")}
                  className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${activeRole === "traveler" ? "bg-[#5A5A40] text-white shadow" : "text-[#4A4A40] hover:text-[#2D2D24]"}`}
                >
                  <Users className="w-3.5 h-3.5" /> Traveler App
                </button>
                <button
                  onClick={() => setActiveRole("admin")}
                  className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${activeRole === "admin" ? "bg-[#D48C6F] text-white shadow" : "text-[#4A4A40] hover:text-[#2D2D24]"}`}
                >
                  <Settings className="w-3.5 h-3.5" /> Admin Control
                </button>
              </div>

              {/* Account Dropdown */}
              <div className="flex items-center gap-4" id="header-user-badge">
                <div className="flex items-center gap-2.5 bg-[#F5F2ED] px-4 py-2 rounded-full border border-[#E5E2DD] shadow-inner">
                  <div className="w-6 h-6 rounded-full bg-[#D48C6F]/20 text-[#D48C6F] flex items-center justify-center font-bold text-[10px]">
                    SR
                  </div>
                  <span className="text-xs font-bold text-[#2D2D24]">Senior Ramesh</span>
                </div>
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="p-2.5 bg-[#F5F2ED] hover:bg-red-50 hover:text-red-600 rounded-full border border-[#E5E2DD] text-[#4A4A40] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Role specific view layout */}
          {activeRole === "traveler" ? <TravelerApp /> : <AdminPanel />}
        </div>
      )}
    </div>
  );
}
