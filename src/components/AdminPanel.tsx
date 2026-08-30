import React, { useState, useEffect } from "react";
import { AdminSettings, BroadcastMessage, PendingHiddenGem, AdCampaign } from "../types";
import { 
  Trophy, 
  Settings, 
  Map, 
  Megaphone, 
  Sliders, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Check, 
  X, 
  Sparkles, 
  Plus, 
  Globe, 
  Image as ImageIcon,
  DollarSign
} from "lucide-react";

export default function AdminPanel() {
  const [settings, setSettings] = useState<AdminSettings>({
    liveMapEnabled: true,
    crowdForecastEnabled: true,
    maintenanceModeEnabled: false,
  });

  const [broadcastType, setBroadcastType] = useState<"Weather Alert" | "System Maintenance" | "Travel Tip">("Weather Alert");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [pendingGems, setPendingGems] = useState<PendingHiddenGem[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);

  // Form states for creating a campaign
  const [adTitle, setAdTitle] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adType, setAdType] = useState("Taxis");
  const [adPlacement, setAdPlacement] = useState<"Top Banner" | "Bottom Banner" | "Inline Feed">("Top Banner");
  const [adImgDesc, setAdImgDesc] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const settingsRes = await fetch("/api/admin/settings");
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings(s);
      }

      const broadcastsRes = await fetch("/api/admin/broadcasts");
      if (broadcastsRes.ok) {
        const b = await broadcastsRes.json();
        setBroadcasts(b);
      }

      const gemsRes = await fetch("/api/admin/pending-gems");
      if (gemsRes.ok) {
        const g = await gemsRes.json();
        setPendingGems(g);
      }

      const campaignsRes = await fetch("/api/admin/campaigns");
      if (campaignsRes.ok) {
        const c = await campaignsRes.json();
        setCampaigns(c);
      }
    } catch (err) {
      console.error("Error fetching admin panel data:", err);
    }
  };

  const toggleSetting = async (key: keyof AdminSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      showNotification(`Setting for ${key} updated successfully.`);
    } catch (err) {
      console.error("Error updating setting:", err);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) return;

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: broadcastType,
          content: broadcastContent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBroadcasts([data.broadcast, ...broadcasts]);
        setBroadcastContent("");
        showNotification("Broadcast message dispatched globally!");
      }
    } catch (err) {
      console.error("Error dispatching broadcast:", err);
    }
  };

  const handleApproveGem = async (id: string) => {
    try {
      const res = await fetch("/api/admin/approve-gem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPendingGems(pendingGems.filter(g => g.id !== id));
        showNotification("Hidden Gem approved! It is now active for all travelers.");
      }
    } catch (err) {
      console.error("Error approving gem:", err);
    }
  };

  const handleRejectGem = async (id: string) => {
    try {
      const res = await fetch("/api/admin/reject-gem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPendingGems(pendingGems.filter(g => g.id !== id));
        showNotification("Submission rejected.");
      }
    } catch (err) {
      console.error("Error rejecting gem:", err);
    }
  };

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adLink.trim()) return;

    try {
      const res = await fetch("/api/admin/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: adTitle,
          campaignType: adType,
          placement: adPlacement,
          affiliateLink: adLink,
          imageDescription: adImgDesc,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns([data.campaign, ...campaigns.map(c => c.placement === adPlacement ? { ...c, active: false } : c)]);
        setAdTitle("");
        setAdLink("");
        setAdImgDesc("");
        showNotification(`New ${adType} ad campaign successfully activated!`);
      }
    } catch (err) {
      console.error("Error launching campaign:", err);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F2ED] text-[#2D2D24] min-h-screen font-sans pb-16" id="admin-main-view">
      {/* Alert Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#5A5A40] text-white px-6 py-4 rounded-[20px] shadow-xl flex items-center gap-3 animate-fade-in border border-[#E5E2DD]" id="admin-toast">
          <ShieldCheck className="w-5 h-5 text-[#F5F2ED]" />
          <span className="font-semibold text-sm">{notification}</span>
        </div>
      )}
 
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8" id="admin-dashboard-container">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5E2DD] pb-6" id="admin-header-title-block">
          <div>
            <div className="flex items-center gap-2 text-[#5A5A40] font-bold text-sm tracking-widest uppercase mb-1">
              <Settings className="w-4 h-4" /> Secure Control Center
            </div>
            <h1 className="text-3xl font-serif italic text-[#2D2D24] tracking-tight">Overview Dashboard</h1>
            <p className="text-[#4A4A40] text-sm mt-1">Configure live settings, monetize through campaigns, and approve traveler-authored content.</p>
          </div>
          <div className="flex items-center gap-3 bg-[#FDFCF9] px-4 py-2.5 rounded-[20px] border border-[#E5E2DD] shadow-sm" id="admin-badge-ops">
            <span className="w-2.5 h-2.5 bg-[#5A5A40] rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-[#5A5A40] tracking-wider uppercase">System Live</span>
          </div>
        </div>

        {/* Overview Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="admin-stats-grid">
          <div className="bg-[#FDFCF9] p-6 rounded-[24px] border border-[#E5E2DD] shadow-sm flex items-center justify-between" id="stat-card-active">
            <div>
              <span className="text-[#4A4A40] text-xs font-bold uppercase tracking-wider block">Active Users (24h)</span>
              <span className="text-2xl font-bold mt-1 block text-[#2D2D24]">41,600</span>
              <span className="text-[#5A5A40] text-xs font-semibold flex items-center gap-1 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> +14% vs yesterday
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
              <Users className="w-6 h-6" />
            </div>
          </div>
 
          <div className="bg-[#FDFCF9] p-6 rounded-[24px] border border-[#E5E2DD] shadow-sm flex items-center justify-between" id="stat-card-ads">
            <div>
              <span className="text-[#4A4A40] text-xs font-bold uppercase tracking-wider block">Ad CTR Avg</span>
              <span className="text-2xl font-bold mt-1 block text-[#2D2D24]">5.82%</span>
              <span className="text-[#D48C6F] text-xs font-semibold flex items-center gap-1 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> +1.2% this week
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#D48C6F]/10 flex items-center justify-center text-[#D48C6F]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
 
          <div className="bg-[#FDFCF9] p-6 rounded-[24px] border border-[#E5E2DD] shadow-sm flex items-center justify-between" id="stat-card-gems">
            <div>
              <span className="text-[#4A4A40] text-xs font-bold uppercase tracking-wider block">Submitted Gems</span>
              <span className="text-2xl font-bold mt-1 block text-[#2D2D24]">{pendingGems.length + 12}</span>
              <span className="text-[#5A5A40] text-xs font-semibold flex items-center gap-1 mt-1.5">
                <Sparkles className="w-3.5 h-3.5" /> {pendingGems.length} Awaiting Review
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
 
          <div className="bg-[#FDFCF9] p-6 rounded-[24px] border border-[#E5E2DD] shadow-sm flex items-center justify-between" id="stat-card-uptime">
            <div>
              <span className="text-[#4A4A40] text-xs font-bold uppercase tracking-wider block">Server Uptime</span>
              <span className="text-2xl font-bold mt-1 block text-[#2D2D24]">99.98%</span>
              <span className="text-[#4A4A40] text-xs mt-1 block">Latency: 12ms</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
              <Globe className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Controls & Global Broadcast Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="admin-control-broadcast-row">
          {/* Quick Settings Toggles */}
          <div className="lg:col-span-1 bg-[#FDFCF9] rounded-[24px] border border-[#E5E2DD] shadow-sm p-6 flex flex-col" id="admin-quick-controls">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#2D2D24]">System Switches</h2>
              <Sliders className="w-5 h-5 text-[#4A4A40]" />
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F5F2ED] border border-[#E5E2DD]">
                <div>
                  <span className="font-semibold text-sm text-[#2D2D24] block">Live Tracking Map</span>
                  <span className="text-xs text-[#4A4A40]">Active path & pulsing markers</span>
                </div>
                <button 
                  onClick={() => toggleSetting("liveMapEnabled")}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.liveMapEnabled ? "bg-[#5A5A40]" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.liveMapEnabled ? "right-1" : "left-1"}`}></span>
                </button>
              </div>
 
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F5F2ED] border border-[#E5E2DD]">
                <div>
                  <span className="font-semibold text-sm text-[#2D2D24] block">Crowd Forecasts</span>
                  <span className="text-xs text-[#4A4A40]">Simulated density stats</span>
                </div>
                <button 
                  onClick={() => toggleSetting("crowdForecastEnabled")}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.crowdForecastEnabled ? "bg-[#5A5A40]" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.crowdForecastEnabled ? "right-1" : "left-1"}`}></span>
                </button>
              </div>
 
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F5F2ED] border border-[#E5E2DD]">
                <div>
                  <span className="font-semibold text-sm text-[#2D2D24] block">Maintenance Mode</span>
                  <span className="text-xs text-[#4A4A40]">Blocks traveler app access</span>
                </div>
                <button 
                  onClick={() => toggleSetting("maintenanceModeEnabled")}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.maintenanceModeEnabled ? "bg-[#D48C6F]" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceModeEnabled ? "right-1" : "left-1"}`}></span>
                </button>
              </div>
            </div>
          </div>
 
          {/* Global Announcement Broadcast */}
          <div className="lg:col-span-2 bg-[#FDFCF9] rounded-[24px] border border-[#E5E2DD] shadow-sm p-6" id="admin-broadcast-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#2D2D24]">System-Wide Broadcast</h2>
              <Megaphone className="w-5 h-5 text-[#5A5A40]" />
            </div>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-[#4A4A40] mb-1.5">Alert Level</label>
                  <select 
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full bg-[#F5F2ED] border border-[#E5E2DD] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5A5A40] focus:border-[#5A5A40] outline-none"
                  >
                    <option value="Weather Alert">⛅ Weather Alert</option>
                    <option value="System Maintenance">🔧 Maintenance</option>
                    <option value="Travel Tip">💡 Travel Tip</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-[#4A4A40] mb-1.5">Announcement Text</label>
                  <input 
                    type="text"
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Enter urgent instructions to broadcast instantly to all active travelers..."
                    className="w-full bg-white border border-[#E5E2DD] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#5A5A40] focus:border-[#5A5A40] outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-[#4A4A40]">Active alerts are shown directly in the header banner.</span>
                <button 
                  type="submit"
                  className="bg-[#5A5A40] hover:bg-[#43432F] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Pending Traveler Gems & Ad Management Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8" id="admin-moderation-ads-row">
          {/* Traveler Content Approvals */}
          <div className="xl:col-span-1 bg-[#FDFCF9] rounded-[24px] border border-[#E5E2DD] shadow-sm p-6 flex flex-col h-[460px]" id="admin-approvals-box">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#2D2D24]">Moderate Hidden Gems</h2>
              <span className="bg-[#D48C6F] text-white text-xs font-bold px-2.5 py-1 rounded-full">{pendingGems.length} Pending</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {pendingGems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Trophy className="w-12 h-12 text-[#5A5A40] mb-2" />
                  <p className="font-semibold text-sm text-[#2D2D24]">All clean!</p>
                  <p className="text-xs text-[#4A4A40] mt-1">No traveler submissions awaiting moderation currently.</p>
                </div>
              ) : (
                pendingGems.map(gem => (
                  <div key={gem.id} className="p-4 border border-[#E5E2DD] rounded-xl bg-[#F5F2ED] space-y-3 shadow-sm" id={`pending-gem-${gem.id}`}>
                    <div className="flex gap-3">
                      <img 
                        src={gem.image} 
                        alt={gem.name} 
                        className="w-16 h-16 rounded-lg object-cover bg-neutral-200 border border-[#E5E2DD] flex-shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-[#2D2D24] truncate">{gem.name}</h4>
                        <p className="text-xs text-[#4A4A40] flex items-center gap-1 font-semibold mt-0.5">
                          <MapPin className="w-3 h-3 text-[#5A5A40]" /> {gem.location}
                        </p>
                        <p className="text-[10px] text-[#4A4A40] mt-1">Submitted by: <span className="font-semibold text-[#5A5A40]">{gem.submittedBy}</span></p>
                      </div>
                    </div>
                    <p className="text-xs text-[#4A4A40] line-clamp-3 bg-white p-2 rounded-lg border border-neutral-200/50 leading-relaxed">{gem.description}</p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button 
                        onClick={() => handleRejectGem(gem.id)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button 
                        onClick={() => handleApproveGem(gem.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#5A5A40] hover:bg-[#43432F] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monetization / Ad Management Campaigns */}
          <div className="xl:col-span-2 bg-[#FDFCF9] rounded-[24px] border border-[#E5E2DD] shadow-sm p-6 flex flex-col h-[460px]" id="admin-ads-monetization">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#2D2D24]">Ad Management &amp; Campaigns</h2>
              <span className="text-xs font-bold bg-[#5A5A40]/10 text-[#5A5A40] px-2.5 py-1 rounded-full uppercase tracking-wide">Sponsored Income Engine</span>
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Active Campaigns List */}
              <div className="space-y-3 overflow-y-auto pr-1">
                <h3 className="text-xs font-bold uppercase text-[#4A4A40] tracking-wider mb-2">Live Banners</h3>
                {campaigns.map(c => (
                  <div 
                    key={c.id} 
                    className={`p-4 border rounded-xl flex items-center justify-between gap-3 ${c.active ? "border-[#5A5A40] bg-[#5A5A40]/10" : "border-[#E5E2DD] bg-[#F5F2ED] opacity-60"}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2D2D24] truncate">{c.title}</span>
                        {c.active && (
                          <span className="bg-[#5A5A40] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                        )}
                      </div>
                      <p className="text-xs text-[#4A4A40] truncate mt-0.5">Placement: <span className="font-semibold">{c.placement}</span> • Type: <span className="font-semibold">{c.campaignType}</span></p>
                      <p className="text-[10px] text-neutral-500 truncate mt-1">URL: {c.affiliateLink}</p>
                    </div>
                    <span className="text-xs font-bold text-[#5A5A40] bg-white px-2 py-1 rounded-lg border border-[#E5E2DD] cursor-pointer">Edit</span>
                  </div>
                ))}
              </div>
 
              {/* Create Campaign Form */}
              <form onSubmit={handleLaunchCampaign} className="space-y-3 border-t lg:border-t-0 lg:border-l border-[#E5E2DD] pt-4 lg:pt-0 lg:pl-6 overflow-y-auto pr-1">
                <h3 className="text-xs font-bold uppercase text-[#4A4A40] tracking-wider">Launch New Campaign</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#4A4A40] uppercase mb-1">Campaign Type</label>
                    <select 
                      value={adType} 
                      onChange={e => setAdType(e.target.value)}
                      className="w-full bg-[#F5F2ED] border border-[#E5E2DD] rounded-lg px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-[#5A5A40] outline-none"
                    >
                      <option value="Taxis">🚖 Taxis</option>
                      <option value="Hotels">🏨 Hotels</option>
                      <option value="Affiliate Services">🔗 Affiliate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#4A4A40] uppercase mb-1">Placement</label>
                    <select 
                      value={adPlacement} 
                      onChange={e => setAdPlacement(e.target.value as any)}
                      className="w-full bg-[#F5F2ED] border border-[#E5E2DD] rounded-lg px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-[#5A5A40] outline-none"
                    >
                      <option value="Top Banner">Top Banner</option>
                      <option value="Bottom Banner">Bottom Banner</option>
                      <option value="Inline Feed">Inline Feed</option>
                    </select>
                  </div>
                </div>
 
                <div>
                  <label className="block text-[10px] font-bold text-[#4A4A40] uppercase mb-1">Campaign Title / Promo Line</label>
                  <input 
                    type="text" 
                    value={adTitle}
                    onChange={e => setAdTitle(e.target.value)}
                    placeholder="e.g., Book a Safe Taxi" 
                    className="w-full border border-[#E5E2DD] rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] outline-none bg-white"
                  />
                </div>
 
                <div>
                  <label className="block text-[10px] font-bold text-[#4A4A40] uppercase mb-1">Affiliate Landing URL</label>
                  <input 
                    type="url" 
                    value={adLink}
                    onChange={e => setAdLink(e.target.value)}
                    placeholder="https://affiliate.example.com/taxi" 
                    className="w-full border border-[#E5E2DD] rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] outline-none bg-white"
                  />
                </div>
 
                <div>
                  <label className="block text-[10px] font-bold text-[#4A4A40] uppercase mb-1">Ad Image / Banner Description</label>
                  <input 
                    type="text" 
                    value={adImgDesc}
                    onChange={e => setAdImgDesc(e.target.value)}
                    placeholder="e.g., Verified senior-friendly premium transport with AC." 
                    className="w-full border border-[#E5E2DD] rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#5A5A40] outline-none bg-white"
                  />
                </div>
 
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="bg-[#5A5A40] hover:bg-[#43432F] text-white font-bold text-xs px-5 py-2 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Activate Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Popular Destinations and Trends table */}
        <section className="bg-[#FDFCF9] rounded-[24px] border border-[#E5E2DD] shadow-sm overflow-hidden" id="admin-trends-table">
          <div className="p-6 border-b border-[#E5E2DD] flex items-center justify-between bg-[#F5F2ED]">
            <h2 className="font-serif italic text-base text-[#2D2D24]">Popular Destinations &amp; User Engagement metrics</h2>
            <button className="text-[#5A5A40] font-bold text-xs hover:underline cursor-pointer">Export Analytics CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#F5F2ED] border-b border-[#E5E2DD]">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase text-[#4A4A40] tracking-wider">Destination</th>
                  <th className="p-4 text-xs font-bold uppercase text-[#4A4A40] tracking-wider">Active Searchers (24h)</th>
                  <th className="p-4 text-xs font-bold uppercase text-[#4A4A40] tracking-wider">Elder-Friendly Rating</th>
                  <th className="p-4 text-xs font-bold uppercase text-[#4A4A40] tracking-wider">Engagement Trend</th>
                  <th className="p-4 text-xs font-bold uppercase text-[#4A4A40] tracking-wider text-right">Interactive Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#2D2D24]">
                <tr className="border-b border-[#E5E2DD]/40 hover:bg-[#F5F2ED]/50 transition-colors">
                  <td className="p-4 font-semibold text-[#2D2D24]">Kyoto, Japan</td>
                  <td className="p-4">12,450</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 bg-[#E5E2DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#5A5A40] w-[85%]"></div>
                      </div>
                      <span className="text-xs font-bold text-[#5A5A40]">85% Perfect</span>
                    </div>
                  </td>
                  <td className="p-4 text-emerald-600 font-semibold flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +14%</td>
                  <td className="p-4 text-right"><button className="text-[#5A5A40] font-bold hover:underline cursor-pointer">Inspect</button></td>
                </tr>
                <tr className="border-b border-[#E5E2DD]/40 hover:bg-[#F5F2ED]/50 transition-colors">
                  <td className="p-4 font-semibold text-[#2D2D24]">Agra, India</td>
                  <td className="p-4">15,800</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 bg-[#E5E2DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#5A5A40] w-[95%]"></div>
                      </div>
                      <span className="text-xs font-bold text-[#5A5A40]">95% Perfect</span>
                    </div>
                  </td>
                  <td className="p-4 text-emerald-600 font-semibold flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +22%</td>
                  <td className="p-4 text-right"><button className="text-[#5A5A40] font-bold hover:underline cursor-pointer">Inspect</button></td>
                </tr>
                <tr className="border-b border-[#E5E2DD]/40 hover:bg-[#F5F2ED]/50 transition-colors">
                  <td className="p-4 font-semibold text-[#2D2D24]">Jaipur, India</td>
                  <td className="p-4">8,200</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 bg-[#E5E2DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#5A5A40] w-[60%]"></div>
                      </div>
                      <span className="text-xs font-bold text-[#4A4A40]">60% Good</span>
                    </div>
                  </td>
                  <td className="p-4 text-emerald-600 font-semibold flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +5%</td>
                  <td className="p-4 text-right"><button className="text-[#5A5A40] font-bold hover:underline cursor-pointer">Inspect</button></td>
                </tr>
                <tr className="hover:bg-[#F5F2ED]/50 transition-colors">
                  <td className="p-4 font-semibold text-[#2D2D24]">Varanasi, India</td>
                  <td className="p-4">5,100</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 bg-[#E5E2DD] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D48C6F] w-[40%]"></div>
                      </div>
                      <span className="text-xs font-bold text-[#D48C6F]">40% Steps Warning</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#D48C6F] font-semibold flex items-center gap-1"><TrendingDown className="w-4 h-4" /> -2%</td>
                  <td className="p-4 text-right"><button className="text-[#5A5A40] font-bold hover:underline cursor-pointer">Inspect</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
