import React, { useState, useEffect, useRef } from "react";
import { 
  Destination, 
  Hotel, 
  Activity, 
  SavedItinerary, 
  AdCampaign, 
  ChatMessage, 
  ItineraryItem,
  AdminSettings
} from "../types";
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Check, 
  User, 
  Send, 
  Bookmark, 
  Share2, 
  HelpCircle, 
  ShieldAlert, 
  Map as MapIcon, 
  Navigation, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  ExternalLink,
  Info,
  SlidersHorizontal,
  Compass,
  CheckCircle,
  AlertCircle,
  X,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Snowflake,
  CloudFog
} from "lucide-react";

export default function TravelerApp() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"plan" | "my-trips" | "support">("plan");
  const [currentStep, setCurrentStep] = useState<number>(1); // Step 1 to 4 in Plan

  // App core database
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);

  // Selected State
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("November 8, 2026 (Diwali Holiday)");
  const [selectedDuration, setSelectedDuration] = useState<number>(2); // 1, 2, or 5 Days
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [hotelCategoryFilter, setHotelCategoryFilter] = useState<"Best Value" | "Luxury Stays">("Best Value");

  // Custom User Gems Submission State
  const [showGemModal, setShowGemModal] = useState(false);
  const [userGemName, setUserGemName] = useState("");
  const [userGemLoc, setUserGemLoc] = useState("");
  const [userGemDesc, setUserGemDesc] = useState("");

  // Saved Itineraries
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [activeTrackingTrip, setActiveTrackingTrip] = useState<SavedItinerary | null>(null);

  // Live Map Simulation States
  const [userMapLocation, setUserMapLocation] = useState({ x: 250, y: 400 });
  const [mapZoom, setMapZoom] = useState(1.0);
  const [mapPrivacyMode, setMapPrivacyMode] = useState(false);
  const [simulatedETA, setSimulatedETA] = useState(8); // in mins

  // Active Admin configurations & Campaign Banner
  const [systemSettings, setSystemSettings] = useState<AdminSettings>({
    liveMapEnabled: true,
    crowdForecastEnabled: true,
    maintenanceModeEnabled: false,
  });
  const [activeCampaign, setActiveCampaign] = useState<AdCampaign | null>(null);
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);

  // Smart Advice from AI
  const [smartAdvice, setSmartAdvice] = useState<string>("");
  const [smartAdviceLoading, setSmartAdviceLoading] = useState(false);

  // Weather state & Custom searchable world places
  const [currentWeather, setCurrentWeather] = useState<any>({
    temp: "24°C",
    condition: "Clear skies",
    icon: "sunny",
    packingAdvice: "☀️ Highly comfortable weather. Recommend packing warm cardigans for cooler nights and comfortable flat walking shoes.",
    forecast: [
      { day: "Tomorrow", temp: "25°C", cond: "Sunny" },
      { day: "Day 2", temp: "23°C", cond: "Clear" },
      { day: "Day 3", temp: "24°C", cond: "Partly Cloudy" }
    ]
  });
  const [customSearchName, setCustomSearchName] = useState("");
  const [searchingCustom, setSearchingCustom] = useState(false);
  const [customSearchError, setCustomSearchError] = useState("");

  // Chat/Expert Support States
  const [expertMessages, setExpertMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "expert",
      text: "Namaste! I am your wise Travel Expert. I specialize in comfortable, senior-friendly travel pacing and accessible landmarks. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCoreData();
    fetchAdminConfig();
    const interval = setInterval(fetchAdminConfig, 5000); // Poll admin changes in background
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedDestination) {
      fetchSmartAdvice(selectedDestination.name, selectedDate);
    }
  }, [selectedDestination, selectedDate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [expertMessages]);

  // Simulate small movement of pulsing user location on the tracking map
  useEffect(() => {
    let animFrame: number;
    const animateMapMarker = () => {
      setUserMapLocation(prev => {
        // Subtle wander
        const deltaX = (Math.random() - 0.5) * 1.5;
        const deltaY = (Math.random() - 0.5) * 1.5;
        // Keep within reasonable map region
        let nx = prev.x + deltaX;
        let ny = prev.y + deltaY;
        if (nx < 100 || nx > 350) nx = 250;
        if (ny < 200 || ny > 600) ny = 400;
        return { x: nx, y: ny };
      });
      setSimulatedETA(prev => {
        if (Math.random() > 0.95) {
          const nextVal = prev - 1;
          return nextVal <= 2 ? 8 : nextVal;
        }
        return prev;
      });
      animFrame = requestAnimationFrame(animateMapMarker);
    };
    if (activeTab === "my-trips" && activeTrackingTrip) {
      animFrame = requestAnimationFrame(animateMapMarker);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [activeTab, activeTrackingTrip]);

  const fetchCoreData = async () => {
    try {
      const destRes = await fetch("/api/destinations");
      if (destRes.ok) {
        const dests = await destRes.json();
        setAllDestinations(dests);
        if (dests.length > 0) {
          setSelectedDestination(dests[0]); // default to Agra
        }
      }

      const hotelsRes = await fetch("/api/hotels");
      if (hotelsRes.ok) {
        setAllHotels(await hotelsRes.json());
      }

      const actRes = await fetch("/api/activities");
      if (actRes.ok) {
        setAllActivities(await actRes.json());
      }
    } catch (err) {
      console.error("Error loading core traveler data:", err);
    }
  };

  const fetchAdminConfig = async () => {
    try {
      const settingsRes = await fetch("/api/admin/settings");
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSystemSettings(s);
      }

      const broadcastsRes = await fetch("/api/admin/broadcasts");
      if (broadcastsRes.ok) {
        const list = await broadcastsRes.json();
        const active = list.find((b: any) => b.active);
        setActiveBroadcast(active ? `${active.type}: ${active.content}` : null);
      }

      const campaignsRes = await fetch("/api/admin/campaigns");
      if (campaignsRes.ok) {
        const list = await campaignsRes.json();
        const activeAd = list.find((c: any) => c.active);
        setActiveCampaign(activeAd || null);
      }
    } catch (err) {
      console.error("Error background polling admin configurations:", err);
    }
  };

  const fetchSmartAdvice = async (destName: string, dateStr: string) => {
    setSmartAdviceLoading(true);
    try {
      const res = await fetch("/api/gemini/smart-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationName: destName, dateText: dateStr }),
      });
      if (res.ok) {
        const data = await res.json();
        setSmartAdvice(data.text);
      }
    } catch (err) {
      console.error("Error loading smart advice:", err);
    } finally {
      setSmartAdviceLoading(false);
    }
  };

  const handleDiscoverCustomDestination = async (name: string) => {
    if (!name.trim()) return;
    setSearchingCustom(true);
    setCustomSearchError("");
    try {
      const res = await fetch("/api/gemini/discover-destination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        // data contains { destination, hotels, activities, weather }
        setSelectedDestination(data.destination);
        setAllHotels(data.hotels);
        setAllActivities(data.activities);
        setCurrentWeather(data.weather);
        
        // Auto select first hotel
        if (data.hotels && data.hotels.length > 0) {
          setSelectedHotel(data.hotels[0]);
        }
        // Auto select activities
        if (data.activities && data.activities.length > 0) {
          setSelectedActivities(data.activities);
        }
        setCustomSearchName("");
      } else {
        setCustomSearchError("Failed to discover this location. Try another place name.");
      }
    } catch (err) {
      console.error("Error discovering custom destination:", err);
      setCustomSearchError("Connection error. Try searching again.");
    } finally {
      setSearchingCustom(false);
    }
  };

  const handleSendChat = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const textToSend = customQuestion || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setExpertMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/gemini/travel-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...expertMessages, userMsg],
          context: {
            destination: selectedDestination?.name,
            selectedDate,
            durationDays: selectedDuration,
            hotel: selectedHotel?.name,
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const expertMsg: ChatMessage = {
          id: "ex-" + Date.now(),
          sender: "expert",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setExpertMessages(prev => [...prev, expertMsg]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleUserSubmitGem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGemName.trim() || !userGemLoc.trim() || !userGemDesc.trim()) return;

    try {
      const res = await fetch("/api/user/submit-gem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userGemName,
          location: userGemLoc,
          description: userGemDesc,
          submittedBy: "Senior Traveler Club"
        }),
      });
      if (res.ok) {
        setUserGemName("");
        setUserGemLoc("");
        setUserGemDesc("");
        setShowGemModal(false);
        alert("Thank you! Your hidden gem recommendation has been sent for admin validation.");
      }
    } catch (err) {
      console.error("Error submitting gem:", err);
    }
  };

  // Build the vertical timeline sequence comfortably
  const generateTimeline = (): ItineraryItem[] => {
    if (!selectedDestination || !selectedHotel) return [];
    
    const items: ItineraryItem[] = [];
    
    // Start
    items.push({
      time: "9:00 AM",
      title: `${selectedHotel.name}`,
      type: "Start",
      description: "Conveniently depart from the hotel lobby. Our verified AC partner taxi waits outside.",
    });

    // Transit
    const selectedLandmarks = selectedActivities.filter(a => a.type === "landmark");
    const selectedGems = selectedActivities.filter(a => a.type === "gem");

    if (selectedLandmarks.length > 0) {
      items.push({
        time: "9:15 AM",
        title: selectedLandmarks[0].name,
        type: "Visit",
        description: selectedLandmarks[0].description,
        durationText: selectedLandmarks[0].timeNeeded,
        image: selectedLandmarks[0].image,
        transitBefore: {
          type: "drive",
          duration: "15 min drive",
          detail: "Smooth driving, light morning traffic expected"
        }
      });
    } else {
      // Default fallback activity
      items.push({
        time: "9:15 AM",
        title: "National History Museum",
        type: "Visit",
        description: "Explore quiet accessible galleries filled with historical artifacts.",
        durationText: "2 hours",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtUd4Jmt0eZcjuwoyFkZAA0JWm__IC6aX_yvpxu1e6uFamqLe02d4anlqk5j9TQq7kmzPdNFM13RYe9uJiTmur999aEfIviiiV-zuCjdQCnZf8Gp0ZCWNj0Fl-rEw8vdM0ytNU0UPusHwBhPdYKOOnrkqBaufo5UYscadkSukUvfm7Z55pKjupxnz2ki78sIWepVRUv2Ov2kV9scY09BUsNL398NPN35483bFBCuhmZ7E1LQ5ucabW8g",
        transitBefore: {
          type: "drive",
          duration: "15 min drive",
          detail: "Smooth driving, light morning traffic expected"
        }
      });
    }

    // Transit Walk
    if (selectedGems.length > 0) {
      items.push({
        time: "11:30 AM",
        title: selectedGems[0].name,
        type: "Lunch",
        description: selectedGems[0].description,
        durationText: selectedGems[0].timeNeeded,
        transitBefore: {
          type: "walk",
          duration: "10 min walk",
          detail: "Quiet, level pedestrian walking path through the shade"
        }
      });
    } else {
      items.push({
        time: "11:25 AM",
        title: "Cafe Serenity Garden",
        type: "Lunch",
        description: "Reserved level seating in the peaceful courtyard garden. Famous for healthy herbal teas and digestible local delicacies.",
        durationText: "1.5 hours",
        transitBefore: {
          type: "walk",
          duration: "10 min walk",
          detail: "Quiet, level pedestrian walking path through the shade"
        }
      });
    }

    return items;
  };

  const handleSaveItinerary = () => {
    if (!selectedDestination || !selectedHotel) return;
    const timeline = generateTimeline();
    const newItin: SavedItinerary = {
      id: "it-" + Date.now(),
      destination: selectedDestination.name,
      date: selectedDate,
      durationDays: selectedDuration,
      hotel: selectedHotel,
      activities: selectedActivities,
      timeline,
      created_at: new Date().toLocaleDateString(),
      weather: currentWeather
    };
    const updated = [newItin, ...savedItineraries];
    setSavedItineraries(updated);
    setActiveTrackingTrip(newItin);
    setActiveTab("my-trips");
  };

  // Filters for Step 2
  const filteredHotels = allHotels.filter(h => {
    if (!selectedDestination) return true;
    const matchesDest = h.id.includes(selectedDestination.id);
    return matchesDest && h.category === hotelCategoryFilter;
  });

  // Filter activities
  const filteredActivities = allActivities.filter(a => {
    if (!selectedDestination) return true;
    return a.id.includes(selectedDestination.id) || a.type === "gem";
  });

  const toggleActivitySelection = (act: Activity) => {
    if (selectedActivities.some(a => a.id === act.id)) {
      setSelectedActivities(selectedActivities.filter(a => a.id !== act.id));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  return (
    <div className="flex-1 bg-[#FDFCF9] text-[#2D2D24] min-h-screen flex flex-col font-sans animate-fade-in" id="traveler-main-app">
      {/* Global Broadcast alert banner configured by Admin */}
      {activeBroadcast && !systemSettings.maintenanceModeEnabled && (
        <div className="bg-[#F5F2ED] border-b border-[#E5E2DD] text-[#D48C6F] text-sm px-6 py-3 font-bold flex items-center justify-between shadow-sm" id="global-broadcast-banner">
          <div className="flex items-center gap-2 max-w-4xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#D48C6F]" />
            <span>{activeBroadcast}</span>
          </div>
          <button 
            onClick={() => setActiveBroadcast(null)}
            className="text-xs uppercase hover:underline font-bold px-3 py-1 bg-white rounded-full border border-[#E5E2DD]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Maintenance Mode screen if enabled by Admin */}
      {systemSettings.maintenanceModeEnabled ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto" id="maintenance-view">
          <ShieldAlert className="w-16 h-16 text-[#D48C6F] mb-4 animate-bounce" />
          <h2 className="text-2xl font-serif italic text-[#2D2D24]">System Maintenance</h2>
          <p className="text-[#4A4A40] text-base mt-2 leading-relaxed">
            Our digital travel servers are currently receiving safe performance updates by the admin ops team. Please rest comfortably; we will be live again shortly.
          </p>
          <div className="mt-6 px-4 py-2 bg-[#F5F2ED] border border-[#E5E2DD] rounded-full text-xs font-semibold text-[#4A4A40]">
            Target recovery: 15 minutes
          </div>
        </div>
      ) : (
        <>
          {/* Main App Content */}
          <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6" id="traveler-body-content">
            {/* Primary Left Navigation Panel (Hidden on Mobile) */}
            <aside className="hidden md:flex flex-col w-64 bg-white rounded-[32px] border border-[#E5E2DD] p-6 shadow-sm space-y-4 shrink-0 h-[fit-content]" id="traveler-sidebar">
              <div className="flex items-center gap-3 border-b border-[#E5E2DD] pb-5 mb-2">
                <div className="w-11 h-11 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold shadow-sm">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif italic text-[#2D2D24] text-lg leading-tight">Travel Buddy</h4>
                  <span className="text-[11px] font-semibold text-[#8C8C7A]">Elder Companion</span>
                </div>
              </div>
              <button 
                onClick={() => { setActiveTab("plan"); fetchCoreData(); }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full font-bold text-sm text-left transition-all ${activeTab === "plan" ? "bg-[#5A5A40] text-white shadow-sm" : "text-[#4A4A40] hover:bg-[#F5F2ED]"}`}
              >
                <Calendar className="w-4 h-4" /> Plan Smart Trip
              </button>
              <button 
                onClick={() => setActiveTab("my-trips")}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full font-bold text-sm text-left transition-all ${activeTab === "my-trips" ? "bg-[#5A5A40] text-white shadow-sm" : "text-[#4A4A40] hover:bg-[#F5F2ED]"}`}
              >
                <MapIcon className="w-4 h-4" /> My Trips &amp; Maps
              </button>
              <button 
                onClick={() => setActiveTab("support")}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full font-bold text-sm text-left transition-all ${activeTab === "support" ? "bg-[#5A5A40] text-white shadow-sm" : "text-[#4A4A40] hover:bg-[#F5F2ED]"}`}
              >
                <HelpCircle className="w-4 h-4" /> Travel Expert Chat
              </button>

              <div className="pt-8 text-center text-xs text-[#424752] border-t border-neutral-100">
                <p className="font-semibold">Trusted Senior Safe App</p>
                <p className="mt-1">© 2026 Travel Buddy Inc.</p>
              </div>
            </aside>

            {/* Main Interactive Canvas Area */}
            <main className="flex-1 bg-white rounded-[32px] border border-[#E5E2DD] p-6 md:p-10 shadow-sm flex flex-col min-w-0 min-h-[500px]" id="traveler-app-canvas">
              {/* Active Tab rendering */}
              
              {/* TAB 1: TRIP PLANNER FLOW (STEPS 1 to 4) */}
              {activeTab === "plan" && (
                <div className="flex-1 flex flex-col space-y-8" id="planner-step-flow">
                  {/* Step Progress Line */}
                  <div className="w-full" id="planner-progress-tracker">
                    <div className="flex justify-between text-xs font-bold text-[#8C8C7A] mb-3 uppercase tracking-wider">
                      <span className={currentStep >= 1 ? "text-[#5A5A40] font-extrabold" : ""}>1. Select Destination</span>
                      <span className={currentStep >= 2 ? "text-[#5A5A40] font-extrabold" : ""}>2. Stays</span>
                      <span className={currentStep >= 3 ? "text-[#5A5A40] font-extrabold" : ""}>3. Wonders</span>
                      <span className={currentStep >= 4 ? "text-[#5A5A40] font-extrabold" : ""}>4. Ready</span>
                    </div>
                    <div className="w-full bg-[#F5F2ED] rounded-full h-2.5 flex overflow-hidden border border-[#E5E2DD]/20">
                      <div 
                        className="bg-[#5A5A40] h-full transition-all duration-500 rounded-full" 
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
 
                  {/* STEP 1: DESTINATION & DATES */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-fade-in" id="step-1-content">
                      <div className="text-center md:text-left space-y-1">
                        <h2 className="text-3xl font-serif italic text-[#2D2D24]">Where are we exploring today?</h2>
                        <p className="text-[#4A4A40] text-base">Select your dream city, safe travel dates, and companion advice.</p>
                      </div>
 
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Destination select */}
                        <div className="space-y-6 bg-[#F5F2ED] p-6 rounded-[24px] border border-[#E5E2DD] shadow-sm">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold uppercase text-[#4A4A40]">Search Destination</label>
                              <span className="text-[10px] bg-[#5A5A40]/15 text-[#5A5A40] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Real-Time Discovery</span>
                            </div>

                            {/* Dual Mode Switcher */}
                            <div className="grid grid-cols-2 gap-1 p-1 bg-white border border-[#E5E2DD] rounded-xl mb-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (allDestinations.length > 0) {
                                    setSelectedDestination(allDestinations[0]);
                                  }
                                }}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  allDestinations.find(d => d.id === selectedDestination?.id) 
                                    ? "bg-[#5A5A40] text-white" 
                                    : "text-[#4A4A40] hover:text-[#2D2D24]"
                                }`}
                              >
                                India Tour
                              </button>
                              <button
                                type="button"
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  !allDestinations.find(d => d.id === selectedDestination?.id)
                                    ? "bg-[#5A5A40] text-white"
                                    : "text-[#4A4A40] hover:text-[#2D2D24]"
                                }`}
                              >
                                Global Explorer
                              </button>
                            </div>

                            {/* Conditional Inputs */}
                            {allDestinations.find(d => d.id === selectedDestination?.id) ? (
                              <div className="relative flex items-center">
                                <Search className="w-5 h-5 absolute left-4 text-[#8C8C7A]" />
                                <select 
                                  value={selectedDestination?.id || ""}
                                  onChange={(e) => {
                                    const dest = allDestinations.find(d => d.id === e.target.value);
                                    if (dest) setSelectedDestination(dest);
                                  }}
                                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#E5E2DD] bg-white text-[#2D2D24] font-medium text-base focus:ring-2 focus:ring-[#5A5A40] outline-none cursor-pointer"
                                >
                                  {allDestinations.map(dest => (
                                    <option key={dest.id} value={dest.id}>{dest.name}, India</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <div className="relative flex-1 flex items-center">
                                    <Search className="w-5 h-5 absolute left-4 text-[#8C8C7A]" />
                                    <input
                                      type="text"
                                      value={customSearchName}
                                      onChange={(e) => setCustomSearchName(e.target.value)}
                                      placeholder="Search Kyoto, Paris, Rome, Bali..."
                                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#E5E2DD] bg-white text-[#2D2D24] font-medium text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleDiscoverCustomDestination(customSearchName);
                                        }
                                      }}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    disabled={searchingCustom || !customSearchName.trim()}
                                    onClick={() => handleDiscoverCustomDestination(customSearchName)}
                                    className="bg-[#5A5A40] hover:bg-[#43432F] disabled:opacity-50 text-white font-bold px-4 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                                  >
                                    {searchingCustom ? "Searching..." : <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-300" /> Explore</span>}
                                  </button>
                                </div>
                                {customSearchError && (
                                  <p className="text-xs font-semibold text-red-600">{customSearchError}</p>
                                )}
                              </div>
                            )}
                          </div>
 
                          <div>
                            <span className="block text-xs font-bold uppercase text-[#4A4A40] mb-2">Quick Recommendations</span>
                            <div className="flex flex-wrap gap-2">
                              {allDestinations.map(dest => (
                                <button
                                  key={dest.id}
                                  onClick={() => setSelectedDestination(dest)}
                                  className={`px-5 py-2 h-11 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${selectedDestination?.id === dest.id ? "bg-[#5A5A40] text-white border-[#5A5A40]" : "border-[#E5E2DD] text-[#2D2D24] hover:bg-white bg-white"}`}
                                >
                                  {dest.name}
                                </button>
                              ))}
                            </div>
                          </div>
 
                          {/* Duration Card */}
                          <div>
                            <span className="block text-xs font-bold uppercase text-[#4A4A40] mb-2">Trip Duration</span>
                            <div className="grid grid-cols-3 gap-3">
                              {[1, 2, 5].map(d => (
                                <button
                                  key={d}
                                  onClick={() => setSelectedDuration(d)}
                                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${selectedDuration === d ? "border-[#5A5A40] bg-[#5A5A40]/10 text-[#5A5A40]" : "border-[#E5E2DD]/60 bg-white hover:border-[#8C8C7A]"}`}
                                >
                                  <span className="text-xl font-bold">{d}</span>
                                  <span className="text-[11px] font-semibold text-[#4A4A40]">{d === 1 ? "Day" : "Days"}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Calendar Dates Picker (Tactile calendar) */}
                        <div className="space-y-4">
                          <div className="bg-[#F5F2ED] p-5 rounded-[24px] border border-[#E5E2DD] shadow-sm">
                            <label className="block text-xs font-bold uppercase text-[#4A4A40] mb-3">Select Smart Travel Month</label>
                            
                            {/* Static Elegant Calendar Header */}
                            <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-xl border border-[#E5E2DD] shadow-inner">
                              <button className="p-1 rounded-full hover:bg-[#F5F2ED] text-[#5A5A40]"><ChevronLeft className="w-5 h-5" /></button>
                              <span className="font-serif italic font-bold text-sm text-[#5A5A40]">November 2026</span>
                              <button className="p-1 rounded-full hover:bg-[#F5F2ED] text-[#5A5A40]"><ChevronRight className="w-5 h-5" /></button>
                            </div>
 
                            {/* Calendar Grids */}
                            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium">
                              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                                <div key={`${day}-${idx}`} className="text-[#4A4A40] font-extrabold pb-2">{day}</div>
                              ))}
                              
                              {/* Empty padding days for alignment */}
                              <div className="text-neutral-300 py-1.5">1</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">2</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">3</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">4</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">5</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">6</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">7</div>
 
                              {/* Diwali highlight row */}
                              <button 
                                onClick={() => setSelectedDate("November 8, 2026 (Diwali Holiday)")}
                                className={`py-1 rounded-xl border-2 flex flex-col items-center justify-center font-bold relative transition-all ${selectedDate.includes("8") ? "border-[#5A5A40] bg-[#5A5A40]/10 text-[#5A5A40]" : "border-[#D48C6F] bg-[#D48C6F]/5 text-[#D48C6F]"}`}
                              >
                                <span>8</span>
                                <span className="text-[7px] block font-extrabold uppercase leading-none">Diwali</span>
                              </button>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">9</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">10</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">11</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">12</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">13</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">14</div>
 
                              {/* Rest */}
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">15</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">16</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">17</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">18</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">19</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">20</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">21</div>
 
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">22</div>
                              {/* Dev Deepawali festival highlight */}
                              <button 
                                onClick={() => setSelectedDate("November 23, 2026 (Dev Deepawali)")}
                                className={`py-1 rounded-xl border-2 flex flex-col items-center justify-center font-bold relative transition-all ${selectedDate.includes("23") ? "border-[#5A5A40] bg-[#5A5A40]/10 text-[#5A5A40]" : "border-[#5A5A40] bg-[#5A5A40]/5 text-[#5A5A40]"}`}
                              >
                                <span>23</span>
                                <span className="text-[7px] block font-extrabold uppercase leading-none">Fest</span>
                              </button>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">24</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">25</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">26</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">27</div>
                              <div className="py-1.5 hover:bg-white rounded cursor-pointer">28</div>
                            </div>
                          </div>
 
                          {/* Smart Advice Container powered by Gemini */}
                          <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/10 rounded-[24px] p-5 flex gap-4 items-start" id="smart-advice-container">
                            <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] shrink-0">
                              <Sparkles className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-[#5A5A40] mb-1 flex items-center gap-1.5">
                                AI Smart Companion Advice
                              </h4>
                              {smartAdviceLoading ? (
                                <p className="text-xs text-[#4A4A40] animate-pulse">Consulting travel advisory database via Gemini AI...</p>
                              ) : (
                                <p className="text-sm text-[#4A4A40] leading-relaxed font-medium">{smartAdvice || "Agra stands as a glorious monument destination in November. Highly accessible paths are wide open."}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
 
                      {/* Next CTA */}
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="bg-[#5A5A40] hover:bg-[#43432F] text-white font-bold h-14 px-8 rounded-full flex items-center gap-2 shadow-sm hover:shadow active:scale-95 transition-all text-base"
                        >
                          Find Hotels <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                   {/* STEP 2: HOTEL SELECTOR */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-fade-in" id="step-2-content">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-3xl font-serif italic text-[#2D2D24]">Pick your home away from home</h2>
                          <p className="text-[#4A4A40] text-base">We have selected highly rated stays with elder-friendly accessibility support.</p>
                        </div>
                        <div className="flex items-center gap-1.5 self-start md:self-auto bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 px-3 py-1.5 rounded-full shadow-sm">
                          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Live Google Search Results</span>
                        </div>
                      </div>

                      {/* Best Value vs Luxury tabs */}
                      <div className="flex gap-2 border-b border-[#E5E2DD] pb-2">
                        <button
                          onClick={() => setHotelCategoryFilter("Best Value")}
                          className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${hotelCategoryFilter === "Best Value" ? "border-[#5A5A40] text-[#5A5A40]" : "border-transparent text-[#4A4A40]"}`}
                        >
                          🏨 Best Value Comforts
                        </button>
                        <button
                          onClick={() => setHotelCategoryFilter("Luxury Stays")}
                          className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${hotelCategoryFilter === "Luxury Stays" ? "border-[#5A5A40] text-[#5A5A40]" : "border-transparent text-[#4A4A40]"}`}
                        >
                          👑 Luxury Palaces
                        </button>
                      </div>

                      {/* Hotel Grid List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="hotel-selection-grid">
                        {filteredHotels.map(hotel => (
                          <article 
                            key={hotel.id}
                            className={`bg-white rounded-[24px] border overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300 ${selectedHotel?.id === hotel.id ? "border-2 border-[#5A5A40] ring-4 ring-[#5A5A40]/10" : "border-[#E5E2DD]"}`}
                          >
                            <div className="relative h-48 w-full bg-neutral-100 flex-shrink-0">
                              <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                              <div className="absolute top-3 right-3 bg-[#D48C6F] text-white px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow">
                                <Star className="w-3.5 h-3.5 fill-white" /> Guest Favorite
                              </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <h3 className="font-bold text-lg text-[#2D2D24] leading-snug">{hotel.name}</h3>
                                  <div className="flex items-center gap-1 bg-[#F5F2ED] px-2.5 py-1 rounded-lg border border-[#E5E2DD]">
                                    <Star className="w-3.5 h-3.5 fill-[#D48C6F] text-[#D48C6F]" />
                                    <span className="font-bold text-xs text-[#2D2D24]">{hotel.rating}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-[#4A4A40] flex items-center gap-1 font-semibold">
                                  <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" /> {hotel.distance}
                                </p>
                                <p className="text-xs text-[#4A4A40] leading-relaxed">{hotel.description}</p>
                              </div>

                              {/* Accessibility Badges */}
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {hotel.tags.map(tag => (
                                  <span key={tag} className="bg-[#F5F2ED] text-[#4A4A40] px-2.5 py-1 rounded-lg font-bold text-[10px] tracking-wide uppercase border border-[#E5E2DD]/40 whitespace-nowrap">
                                    ✓ {tag}
                                  </span>
                                ))}
                              </div>

                              {/* Price and selector button */}
                              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                                <div>
                                  {hotel.originalPrice && (
                                    <p className="text-xs text-neutral-400 line-through">${hotel.originalPrice}</p>
                                  )}
                                  <p className="text-xl font-extrabold text-[#5A5A40]">${hotel.price} <span className="text-xs font-normal text-[#4A4A40]">/ night</span></p>
                                </div>
                                <button
                                  onClick={() => setSelectedHotel(hotel)}
                                  className={`h-11 px-6 rounded-full font-bold text-sm shadow-sm transition-all ${selectedHotel?.id === hotel.id ? "bg-[#5A5A40] text-white" : "bg-[#5A5A40]/10 text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white"}`}
                                >
                                  {selectedHotel?.id === hotel.id ? "Selected ✓" : "Select"}
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>

                      {/* Navigation CTA controls */}
                      <div className="flex justify-between pt-6 border-t border-neutral-100">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-[#5A5A40] font-bold flex items-center gap-1.5 h-12 px-4 rounded-xl hover:bg-[#F5F2ED]"
                        >
                          <ArrowLeft className="w-4 h-4" /> Destination
                        </button>
                        <button
                          disabled={!selectedHotel}
                          onClick={() => setCurrentStep(3)}
                          className={`h-12 px-8 rounded-full font-bold flex items-center gap-2 shadow transition-all ${selectedHotel ? "bg-[#5A5A40] text-white hover:bg-[#43432F]" : "bg-neutral-200 text-neutral-400 cursor-not-allowed"}`}
                        >
                          Continue to Places <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                   {/* STEP 3: DISCOVER LOCAL WONDERS (ACTIVITIES) */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-fade-in" id="step-3-content">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-3xl font-serif italic text-[#2D2D24]">Discover local wonders</h2>
                          <p className="text-[#4A4A40] text-base">Select landmarks to construct a comfortable itinerary with zero steep stairs.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 px-3 py-1.5 rounded-full shadow-sm">
                            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Live Google Search Results</span>
                          </div>
                          {/* Custom submission button */}
                          <button
                            onClick={() => setShowGemModal(true)}
                            className="flex items-center gap-2 bg-[#D48C6F]/10 border border-[#D48C6F]/30 text-[#D48C6F] font-bold text-xs px-5 py-3 rounded-full hover:bg-[#D48C6F]/20 shadow-sm cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" /> Suggest Hidden Gem
                          </button>
                        </div>
                      </div>

                      {/* Activities grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="activities-moderated-grid">
                        {filteredActivities.map(act => {
                          const isSelected = selectedActivities.some(a => a.id === act.id);
                          return (
                            <div 
                              key={act.id}
                              className={`bg-white rounded-[24px] border overflow-hidden flex flex-col justify-between shadow-sm transition-all ${isSelected ? "border-2 border-[#5A5A40] ring-4 ring-[#5A5A40]/10" : "border-[#E5E2DD]"}`}
                            >
                              <div>
                                {act.image && (
                                  <div className="h-44 w-full bg-neutral-100 relative">
                                    <img src={act.image} alt={act.name} className="w-full h-full object-cover" />
                                    {act.localFavorite && (
                                      <span className="absolute top-3 right-3 bg-[#D48C6F] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
                                        ★ Local Favorite
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div className="p-5 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-base text-[#2D2D24]">{act.name}</h4>
                                    <span className="text-xs text-[#5A5A40] font-semibold bg-[#5A5A40]/10 px-2.5 py-0.5 rounded-lg whitespace-nowrap uppercase">{act.category}</span>
                                  </div>
                                  <p className="text-xs text-[#4A4A40] font-semibold flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> Needed: {act.timeNeeded}
                                  </p>
                                  <p className="text-xs text-[#4A4A40] leading-relaxed">{act.description}</p>
                                </div>
                              </div>

                              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-neutral-50 mt-auto">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40]">
                                  {act.easyWalking ? "✓ Low steps / easy walking" : "⚠️ May have some steps"}
                                </span>
                                <button
                                  onClick={() => toggleActivitySelection(act)}
                                  className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${isSelected ? "bg-[#5A5A40] text-white" : "border-2 border-[#5A5A40] text-[#5A5A40] hover:bg-neutral-50"}`}
                                >
                                  {isSelected ? "Added ✓" : "Add to Itinerary"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Modal for User to Recommend Custom Gem */}
                      {showGemModal && (
                        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                          <div className="bg-white rounded-[32px] max-w-md w-full border border-[#E5E2DD] p-6 shadow-2xl animate-fade-in space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                              <h3 className="font-serif italic text-lg text-[#2D2D24] flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#D48C6F]" /> Suggest Hidden Gem
                              </h3>
                              <button onClick={() => setShowGemModal(false)} className="text-[#4A4A40] font-bold hover:bg-neutral-100 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleUserSubmitGem} className="space-y-3">
                              <div>
                                <label className="block text-xs font-bold uppercase text-[#4A4A40] mb-1">Place Name</label>
                                <input 
                                  type="text" 
                                  required
                                  value={userGemName}
                                  onChange={e => setUserGemName(e.target.value)}
                                  placeholder="e.g., Kashi Tea Stall" 
                                  className="w-full border border-[#E5E2DD] rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#5A5A40] outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase text-[#4A4A40] mb-1">Location Details</label>
                                <input 
                                  type="text" 
                                  required
                                  value={userGemLoc}
                                  onChange={e => setUserGemLoc(e.target.value)}
                                  placeholder="e.g., Near Assi Ghat, Varanasi" 
                                  className="w-full border border-[#E5E2DD] rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#5A5A40] outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase text-[#4A4A40] mb-1">Senior Accessibility Description</label>
                                <textarea 
                                  required
                                  rows={3}
                                  value={userGemDesc}
                                  onChange={e => setUserGemDesc(e.target.value)}
                                  placeholder="Describe why it is comfortable for senior citizens (e.g. flat floors, ramps, robust seats, quiet surroundings, helpful staff)." 
                                  className="w-full border border-[#E5E2DD] rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-[#5A5A40] outline-none"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setShowGemModal(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#D48C6F] hover:bg-[#b0745a] text-white rounded-lg text-sm font-bold shadow-md">Submit Recommendation</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

                      {/* Navigation CTA controls */}
                      <div className="flex justify-between pt-6 border-t border-neutral-100">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-[#5A5A40] font-bold flex items-center gap-1.5 h-12 px-4 rounded-xl hover:bg-[#F5F2ED]"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Stays
                        </button>
                        <button
                          onClick={() => setCurrentStep(4)}
                          className="h-14 px-8 bg-[#5A5A40] hover:bg-[#43432F] text-white font-bold rounded-full flex items-center gap-2 shadow-lg active:scale-95"
                        >
                          Generate Itinerary <span className="bg-[#FDFCF9] text-[#5A5A40] text-xs font-extrabold px-2.5 py-0.5 rounded-full">{selectedActivities.length}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: TIMELINE (READY & AD MONETIZATION ACTIVE) */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-fade-in" id="step-4-content">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-serif italic text-[#2D2D24]">Your Smart Journey is Ready</h2>
                        <p className="text-[#4A4A40] text-base">We've constructed a beautifully paced day focused on comfort.</p>
                      </div>
 
                      {/* Sponsored monetization banner controlled from Admin Control center! */}
                      {activeCampaign && (
                        <a 
                          href={activeCampaign.affiliateLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block bg-[#F5F2ED] border-2 border-[#E5E2DD] rounded-[24px] p-5 hover:bg-[#E5E2DD]/40 transition-colors shadow-sm cursor-pointer"
                          id="sponsored-campaign-itinerary-banner"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold">
                                {activeCampaign.campaignType === "Taxis" ? "🚕" : "🔗"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-[#5A5A40] text-base">{activeCampaign.title}</span>
                                  <span className="bg-[#D48C6F] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Sponsored</span>
                                </div>
                                <p className="text-xs text-[#4A4A40] font-medium mt-0.5">{activeCampaign.imageDescription}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#5A5A40] border border-[#5A5A40] px-4 py-2 rounded-full bg-white flex items-center gap-1">
                              Book Ride <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </a>
                      )}
 
                      {/* Vertical timeline */}
                      <div className="relative border-l-2 border-[#5A5A40] ml-4 pl-8 space-y-8 py-2" id="itinerary-timeline">
                        {generateTimeline().map((item, index) => (
                          <div key={index} className="relative space-y-3" id={`timeline-item-${index}`}>
                            {/* Olive dot on line */}
                            <span className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-[#5A5A40] z-10"></span>
                            
                            <div className="bg-white p-5 rounded-[24px] border border-[#E5E2DD] shadow-sm space-y-3 max-w-xl">
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-base text-[#5A5A40]">{item.time}</span>
                                <span className="bg-[#5A5A40]/10 text-[#5A5A40] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{item.type}</span>
                              </div>
                              <h3 className="font-bold text-lg text-[#2D2D24]">{item.title}</h3>
                              <p className="text-sm text-[#4A4A40] leading-relaxed">{item.description}</p>
                              
                              {item.durationText && (
                                <div className="text-xs text-[#4A4A40] font-semibold bg-[#F5F2ED] px-3 py-2 rounded-xl inline-flex items-center gap-1.5 border border-[#E5E2DD]/40">
                                  <Clock className="w-3.5 h-3.5" /> Duration: {item.durationText}
                                </div>
                              )}
 
                              {item.image && (
                                <div className="h-40 rounded-xl overflow-hidden mt-2 bg-neutral-100 border border-neutral-100">
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
 
                            {/* Transit connecting card */}
                            {item.transitBefore && (
                              <div className="bg-[#F5F2ED] border border-[#E5E2DD] rounded-xl p-3 max-w-xl flex items-center gap-3 shadow-inner ml-2">
                                <span className="text-xl">
                                  {item.transitBefore.type === "drive" ? "🚗" : "🚶"}
                                </span>
                                <div>
                                  <span className="font-bold text-xs text-[#2D2D24] block">{item.transitBefore.duration}</span>
                                  <span className="text-[10px] text-[#4A4A40]">{item.transitBefore.detail}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
 
                      {/* Travel expert Chat assistance right on timeline */}
                      <div className="bg-[#F5F2ED] rounded-[24px] border border-[#E5E2DD] p-5 max-w-xl" id="itinerary-ai-helper">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#5A5A40] mb-2">
                          <Sparkles className="w-4 h-4 animate-spin" /> Live Travel Expert Companion
                        </div>
                        <p className="text-xs text-[#4A4A40] mb-3">Ask me anything about restrooms, crowd pace, or boarding safety on this path!</p>
                        
                        <div className="flex gap-2 flex-wrap mb-4">
                          <button 
                            onClick={() => handleSendChat(undefined, "Are there fully flat wheelchair entrances at the landmark?")}
                            className="bg-white border border-[#E5E2DD] hover:border-[#5A5A40] text-[11px] font-bold px-3 py-1.5 rounded-full text-[#4A4A40]"
                          >
                            ❓ Accessible Entrances?
                          </button>
                          <button 
                            onClick={() => handleSendChat(undefined, "Where are clean accessible washrooms on this route?")}
                            className="bg-white border border-[#E5E2DD] hover:border-[#5A5A40] text-[11px] font-bold px-3 py-1.5 rounded-full text-[#4A4A40]"
                          >
                            ❓ Clean Washrooms?
                          </button>
                        </div>
 
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask travel expert..." 
                            className="flex-1 bg-white border border-[#E5E2DD] rounded-xl px-4 text-xs outline-none"
                          />
                          <button 
                            onClick={() => handleSendChat()}
                            className="bg-[#5A5A40] hover:bg-[#43432F] text-white p-2.5 rounded-xl shadow active:scale-95"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
 
                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-100 max-w-xl">
                        <button
                          onClick={handleSaveItinerary}
                          className="flex-1 h-14 bg-[#5A5A40] hover:bg-[#43432F] text-white font-bold rounded-full shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all text-base"
                        >
                          <Bookmark className="w-5 h-5 fill-white" /> Save to My Trips
                        </button>
                        <button
                          onClick={() => alert(`Share itinerary link copied! Send it to your children on WhatsApp so they can monitor your safe route live.`)}
                          className="flex-1 h-14 bg-white border-2 border-[#5A5A40] text-[#5A5A40] hover:bg-[#F5F2ED] font-bold rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all text-base"
                        >
                          <Share2 className="w-5 h-5" /> Share with Family
                        </button>
                      </div>
 
                      <div className="flex justify-start">
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="text-[#5A5A40] font-bold flex items-center gap-1 px-4 h-11 rounded-xl hover:bg-[#F5F2ED]"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Activities
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MY TRIPS & LIVE MAP TRACKING */}
              {activeTab === "my-trips" && (
                <div className="flex-1 flex flex-col space-y-6 animate-fade-in" id="trips-tracking-canvas">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-serif italic text-[#2D2D24]">Live Trip Tracking</h2>
                    <p className="text-[#4A4A40] text-base">Your family sees your safe progress in real-time. Everything is protected.</p>
                  </div>
 
                  {/* Settings toggle verification */}
                  {!systemSettings.liveMapEnabled ? (
                    <div className="bg-[#F5F2ED] border border-[#E5E2DD] p-6 rounded-[24px] flex flex-col items-center text-center max-w-md mx-auto" id="map-disabled-banner">
                      <AlertCircle className="w-12 h-12 text-[#D48C6F] mb-3" />
                      <h4 className="font-serif italic text-lg text-[#2D2D24]">Live Map Suspended</h4>
                      <p className="text-xs text-[#4A4A40] mt-1">Live mapping feature has been switched off by administration. Please refer to support for updates.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Map Tracking Simulator */}
                      <div className="lg:col-span-2 relative h-[450px] bg-neutral-100 rounded-[24px] overflow-hidden border border-[#E5E2DD] shadow-inner" id="simulated-map-wrapper">
                        {/* Map Backdrop */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                          style={{ 
                            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCiq45KSO8dzsraUmDKb7HZQBzApXHW_PmKedbWKNPoZxvZ9MrnlgDR_sKprUjnFz4yDJC9rbaH4dEdRlQo2Ua9eo_On_8kpsMZef0r3MteNDdczGHZ7_rIy-zYZD9MfI0yglp-2b7bwSAq23ZM8NXfpFZNtn4FSqF2_OeqS-0-rotGgOFDr5QPrlZr3rk2fGL-13WOobWrejt13geBy28QjCLr6Qyd9z0Fl_m8M1A7f-3RGHL856bCGA')`,
                            transform: `scale(${mapZoom})`,
                            filter: mapPrivacyMode ? "blur(15px)" : "none"
                          }}
                        />
 
                        {/* Route Line */}
                        {!mapPrivacyMode && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 450">
                            {/* Completed path */}
                            <path 
                              d="M 120 380 C 180 300, 220 280, 250 240" 
                              fill="none" 
                              stroke="#5A5A40" 
                              strokeWidth="6" 
                              strokeLinecap="round" 
                              className="opacity-80"
                            />
                            {/* Predicted path */}
                            <path 
                              d="M 250 240 C 280 200, 310 120, 380 90" 
                              fill="none" 
                              stroke="#5A5A40" 
                              strokeWidth="4" 
                              strokeLinecap="round" 
                              strokeDasharray="8,6" 
                              className="opacity-40 animate-pulse"
                            />
                          </svg>
                        )}
 
                        {/* Pulse Marker (User current location) */}
                        {!mapPrivacyMode && (
                          <div 
                            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${userMapLocation.x}px`, top: `${userMapLocation.y - 120}px` }}
                          >
                            <div className="relative flex items-center justify-center">
                              <span className="absolute w-8 h-8 rounded-full bg-[#5A5A40]/30 animate-ping"></span>
                              <span className="w-5 h-5 rounded-full bg-[#5A5A40] border-4 border-white shadow-md"></span>
                            </div>
                          </div>
                        )}
 
                        {/* Top Left: Overlay status */}
                        <div className="absolute top-4 left-4 z-30 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-[#E5E2DD] shadow-md">
                          <span className="text-[10px] font-extrabold uppercase text-[#4A4A40] tracking-widest block">City Map Live</span>
                          <span className="text-xs font-bold text-[#5A5A40]">{activeTrackingTrip ? activeTrackingTrip.destination : "Agra"}, India</span>
                        </div>
 
                        {/* Map controls floating right */}
                        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                          <button 
                            onClick={() => setMapPrivacyMode(!mapPrivacyMode)}
                            title="Toggle Privacy Map View"
                            className="w-11 h-11 bg-white text-[#4A4A40] hover:bg-[#F5F2ED] rounded-full shadow-md flex items-center justify-center border border-[#E5E2DD] transition-all active:scale-95"
                          >
                            🔒
                          </button>
                        </div>
 
                        <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
                          <div className="bg-white rounded-xl shadow-md flex flex-col overflow-hidden border border-[#E5E2DD]">
                            <button 
                              onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 2.5))}
                              className="w-11 h-11 text-[#4A4A40] font-bold flex items-center justify-center hover:bg-[#F5F2ED] active:bg-neutral-100"
                            >
                              +
                            </button>
                            <button 
                              onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.8))}
                              className="w-11 h-11 text-[#4A4A40] font-bold flex items-center justify-center hover:bg-[#F5F2ED] active:bg-neutral-100 border-t border-[#E5E2DD]"
                            >
                              -
                            </button>
                          </div>
                          <button 
                            onClick={() => { setUserMapLocation({ x: 250, y: 400 }); setMapZoom(1.0); }}
                            className="w-11 h-11 bg-[#5A5A40] text-white hover:bg-[#43432F] rounded-full shadow-md flex items-center justify-center transition-all active:scale-95"
                          >
                            🎯
                          </button>
                        </div>
 
                        {/* Bottom Live Tracking Card */}
                        <div className="absolute bottom-4 left-4 right-4 z-30">
                          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-[#E5E2DD] max-w-md">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] shrink-0">
                                  <Navigation className="w-5 h-5 animate-pulse text-[#5A5A40]" />
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-[#2D2D24]">Active Live Navigation</h4>
                                  <p className="text-xs text-[#4A4A40]">To National History Museum</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-base font-extrabold text-[#5A5A40]">{simulatedETA} mins</div>
                                <div className="text-[10px] text-[#4A4A40] font-bold">1.2 km away</div>
                              </div>
                            </div>
                            <div className="w-full bg-[#F5F2ED] rounded-full h-1.5 overflow-hidden mt-3">
                              <div className="h-full bg-[#5A5A40] rounded-full" style={{ width: "65%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
 
                      {/* Right: Saved Journeys List */}
                      <div className="lg:col-span-1 space-y-4 font-sans" id="saved-journeys-panel">
                        <h3 className="text-xs font-bold uppercase text-[#4A4A40] tracking-wider">My Saved Journeys</h3>
                        {savedItineraries.length === 0 ? (
                          <div className="bg-[#F5F2ED] rounded-[24px] p-6 border text-center border-dashed border-[#E5E2DD]" id="no-journeys-prompt">
                            <Compass className="w-8 h-8 text-[#5A5A40] mx-auto mb-2 opacity-50" />
                            <p className="font-bold text-sm text-[#2D2D24]">No journeys saved yet</p>
                            <p className="text-xs text-[#4A4A40] mt-1">Plan a trip in the planner tab and save it to enable tracking here!</p>
                            <button 
                              onClick={() => { setActiveTab("plan"); setCurrentStep(1); }}
                              className="mt-4 bg-[#5A5A40] text-white font-bold text-xs px-5 py-2.5 rounded-full cursor-pointer hover:bg-[#43432F]"
                            >
                              Start Planning
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                            {savedItineraries.map(itin => (
                              <div 
                                key={itin.id}
                                onClick={() => setActiveTrackingTrip(itin)}
                                className={`p-4 border rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-between ${activeTrackingTrip?.id === itin.id ? "border-2 border-[#5A5A40] bg-[#5A5A40]/10" : "border-[#E5E2DD] bg-white hover:bg-[#F5F2ED]"}`}
                              >
                                <div>
                                  <h4 className="font-bold text-sm text-[#2D2D24]">{itin.destination} Journey</h4>
                                  <p className="text-[10px] font-semibold text-[#4A4A40] mt-0.5">{itin.date} • {itin.durationDays} Days</p>
                                  <p className="text-[10px] text-neutral-500 truncate mt-1">Stay: {itin.hotel.name}</p>
                                </div>
                                <span className="text-[11px] font-bold text-[#5A5A40] bg-white border border-[#E5E2DD] px-3 py-1.5 rounded-full">Track</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Real-time Weather Forecast & Packing card */}
                        <div className="bg-[#FDFCF9] rounded-[24px] p-5 border border-[#E5E2DD] shadow-sm space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase text-[#4A4A40] tracking-wider flex items-center gap-1.5">
                              ☀️ Weather &amp; Packing
                            </h4>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Google Live
                              </span>
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>
                            </div>
                          </div>

                          {/* Main Weather details */}
                          <div className="flex items-center justify-between bg-gradient-to-br from-[#F5F2ED]/60 to-[#E5E2DD]/20 p-4 rounded-2xl border border-[#E5E2DD]">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#8C8C7A] uppercase tracking-wider block">
                                Current in {activeTrackingTrip ? activeTrackingTrip.destination : (selectedDestination ? selectedDestination.name : "Agra")}
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-serif font-extrabold text-[#2D2D24]">
                                  {activeTrackingTrip?.weather?.temp || currentWeather.temp}
                                </span>
                                <span className="text-xs font-bold text-[#4A4A40]">
                                  {activeTrackingTrip?.weather?.condition || currentWeather.condition}
                                </span>
                              </div>
                            </div>
                            
                            {/* Weather Icon renderer */}
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#5A5A40] shadow-sm border border-[#E5E2DD]/40 shrink-0">
                              {(() => {
                                const cond = (activeTrackingTrip?.weather?.icon || currentWeather.icon || "sunny").toLowerCase();
                                if (cond.includes("rain") || cond.includes("shower") || cond.includes("wet")) return <CloudRain className="w-5 h-5 text-blue-500" />;
                                if (cond.includes("cloud") || cond.includes("overcast")) return <Cloud className="w-5 h-5 text-[#8C8C7A]" />;
                                if (cond.includes("wind") || cond.includes("breeze")) return <Wind className="w-5 h-5 text-[#5A5A40]" />;
                                if (cond.includes("snow") || cond.includes("freeze")) return <Snowflake className="w-5 h-5 text-cyan-400" />;
                                if (cond.includes("fog") || cond.includes("mist")) return <CloudFog className="w-5 h-5 text-[#8C8C7A]" />;
                                return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />;
                              })()}
                            </div>
                          </div>

                          {/* Packing Advisory */}
                          <div className="bg-[#5A5A40]/5 p-3.5 rounded-xl border border-[#5A5A40]/10">
                            <span className="text-[10px] font-extrabold uppercase text-[#5A5A40] tracking-wider block mb-1">👵 Senior Packing Advisory</span>
                            <p className="text-xs text-[#4A4A40] leading-relaxed font-semibold">
                              {activeTrackingTrip?.weather?.packingAdvice || currentWeather.packingAdvice}
                            </p>
                          </div>

                          {/* 3-day Forecast List */}
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-[#8C8C7A] tracking-wider block mb-2">3-Day Packing Forecast</span>
                            <div className="space-y-2">
                              {(activeTrackingTrip?.weather?.forecast || currentWeather.forecast || []).map((fc: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#E5E2DD]/40 last:border-0 font-medium">
                                  <span className="text-[#4A4A40] font-bold">{fc.day}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-neutral-500 font-semibold">{fc.cond}</span>
                                    <span className="text-[#2D2D24] font-bold bg-[#F5F2ED] px-2 py-0.5 rounded-md border border-[#E5E2DD]/30">{fc.temp}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: HELP & LIVE CHAT WITH TRAVEL COMPANION */}
              {activeTab === "support" && (
                <div className="flex-1 flex flex-col space-y-4 animate-fade-in h-[480px]" id="chat-assistance-canvas">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-serif italic text-[#2D2D24]">AI Travel Expert Companion</h2>
                    <p className="text-[#4A4A40] text-base">Your digital buddy is here to assist with physical pacing, clean restrooms, or safe boarding guidelines.</p>
                  </div>
 
                  {/* Chat interface */}
                  <div className="flex-1 border border-[#E5E2DD] bg-[#FDFCF9] rounded-[24px] flex flex-col overflow-hidden shadow-inner h-96" id="chat-box-interface">
                    {/* Chat stream area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F5F2ED]/30" id="chat-messages-stream">
                      {expertMessages.map(msg => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`p-4 rounded-[20px] max-w-md shadow-sm border ${msg.sender === "user" ? "bg-[#5A5A40] text-white border-[#5A5A40]" : "bg-white text-[#2D2D24] border-[#E5E2DD]"}`}>
                            <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                            <span className={`text-[9px] block text-right mt-1.5 ${msg.sender === "user" ? "text-white/75" : "text-[#8C8C7A]"}`}>{msg.timestamp}</span>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white p-4 rounded-[20px] border border-[#E5E2DD] max-w-xs shadow-sm">
                            <span className="text-xs text-[#4A4A40] font-semibold animate-pulse flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 animate-spin text-[#5A5A40]" /> companion typing...
                            </span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
 
                    {/* Chat quick suggestion chips */}
                    <div className="p-3 bg-white border-t border-[#E5E2DD] overflow-x-auto flex gap-2 no-scrollbar" id="chat-quick-suggestions">
                      <button 
                        onClick={() => handleSendChat(undefined, "Is the Taj Mahal fully wheelchair accessible?")}
                        className="bg-[#F5F2ED] border border-[#E5E2DD] text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap text-[#4A4A40] hover:border-[#5A5A40]"
                      >
                        ♿ Taj Mahal accessibility?
                      </button>
                      <button 
                        onClick={() => handleSendChat(undefined, "How can an elder board a boat in Varanasi safely?")}
                        className="bg-[#F5F2ED] border border-[#E5E2DD] text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap text-[#4A4A40] hover:border-[#5A5A40]"
                      >
                        ⛵ Safe boat boarding in Varanasi?
                      </button>
                      <button 
                        onClick={() => handleSendChat(undefined, "Where are senior rest benches in Jaipur City Palace?")}
                        className="bg-[#F5F2ED] border border-[#E5E2DD] text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap text-[#4A4A40] hover:border-[#5A5A40]"
                      >
                        🪑 Resting spots in Jaipur Palace?
                      </button>
                    </div>
 
                    {/* Chat input box */}
                    <form onSubmit={(e) => handleSendChat(e)} className="p-4 bg-white border-t border-[#E5E2DD] flex gap-3" id="chat-input-form-block">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Type your comfortable travel question here..." 
                        className="flex-1 bg-[#F5F2ED] border border-[#E5E2DD] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40] focus:border-[#5A5A40] outline-none"
                      />
                      <button 
                        type="submit"
                        className="bg-[#5A5A40] hover:bg-[#43432F] text-white px-5 rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </main>
          </div>
 
          {/* Persistent Mobile Bottom Navigation Bar (Hidden on Desktops) */}
          <nav className="md:hidden fixed bottom-0 w-full z-40 flex justify-around items-center px-4 py-2 bg-white border-t-2 border-[#E5E2DD] shadow-lg rounded-t-2xl h-20" id="mobile-navigation-bar">
            <button 
              onClick={() => { setActiveTab("plan"); fetchCoreData(); }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === "plan" ? "bg-[#5A5A40]/10 text-[#5A5A40] px-5 py-1.5" : "text-[#4A4A40]"}`}
            >
              <Calendar className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">Plan</span>
            </button>
            <button 
              onClick={() => setActiveTab("my-trips")}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === "my-trips" ? "bg-[#5A5A40]/10 text-[#5A5A40] px-5 py-1.5" : "text-[#4A4A40]"}`}
            >
              <MapIcon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">My Trips</span>
            </button>
            <button 
              onClick={() => setActiveTab("support")}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === "support" ? "bg-[#5A5A40]/10 text-[#5A5A40] px-5 py-1.5" : "text-[#4A4A40]"}`}
            >
              <HelpCircle className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">Support</span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
