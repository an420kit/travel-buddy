import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Destination, Hotel, Activity, AdminSettings, BroadcastMessage, PendingHiddenGem, AdCampaign } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side State (In-Memory Database)
let adminSettings: AdminSettings = {
  liveMapEnabled: true,
  crowdForecastEnabled: true,
  maintenanceModeEnabled: false,
};

let broadcasts: BroadcastMessage[] = [
  {
    id: "b1",
    type: "Travel Tip",
    content: "Diwali festival approaches! Make sure to book your temple tickets in Varanasi early to secure evening aarti views.",
    active: true,
    timestamp: new Date().toISOString(),
  }
];

let pendingGems: PendingHiddenGem[] = [
  {
    id: "pg1",
    name: "The Old Mill Cafe",
    location: "Agra, India",
    submittedBy: "User128",
    description: "A cozy rooftop cafe situated in a quiet lane behind Taj Ganj. Serves outstanding organic filter coffee and hand-crafted breakfast with a peaceful, distant view of the Taj Dome, away from the touts.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDZOXIhGmEd6ndzxP2SfO9C3zRuizZ5C9yZwTW_zSsFPC7wm0ys1IcF-6rnWtXk93F_S1KlszcEazewWQJuFvrGHCSffgvKdKBxoMnkupAT1-_HZzVPvQyt2FGq0vJy8RXmdyHsbuw5gvvNDzek6Egs9sB5_aIpcWeWct47ZlNTWVWw1Rlk5wnxchxgbCdXUjFSjC_bZaeVkQEXbRLu6bIKitYl8ElclJGT5-Jn8IHge-HGhyIZJO6aw",
  },
  {
    id: "pg2",
    name: "Sheroes Hangout",
    location: "Agra, India",
    submittedBy: "SeniorTraveler45",
    description: "An inspiring café run by women acid attack survivors. Excellent warm hospitality, reading books, senior-friendly level walking floors, and a beautiful community atmosphere.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0knllOYAYIkCHOJh-nyf_JKLn0nAcJeRBVtNwS8H6G9GXcfAltZDayM7eptMrMzvmkvxFidY9BzdxtEsj_3PqlTQ77X6tT0UOLXcaYQEWMchcD7Isw5sDgFPpzPCWpPXoptFlLt1HsN-L9SihXmR9DeMf_0KciTOsUXFgi_bOI6hwRjbVJiqjcsCsW2OBhEoVggWDd0j_iWwOHVm0FlauMoJzx5XvfomQhEFyuUA_dld9xQbvJVGkTA",
  }
];

let adCampaigns: AdCampaign[] = [
  {
    id: "ad1",
    title: "Book a Safe Taxi",
    campaignType: "Taxis",
    placement: "Top Banner",
    affiliateLink: "https://example.com/taxi-partner-affiliate",
    imageDescription: "Premium air-conditioned sedan with verified senior-friendly drivers.",
    active: true,
  }
];

// Initial Core Data
const destinations: Destination[] = [
  {
    id: "agra",
    name: "Agra",
    description: "City of Taj Mahal, heritage tombs, and rich Mughlai food.",
    smartAdvice: "☀️ Best Weather. Ideal for exploring landmarks and festivals like Taj Mahotsav. November offers beautifully clear blue skies and pleasant cooler air."
  },
  {
    id: "jaipur",
    name: "Jaipur",
    description: "The Pink City, world-renowned for its palaces, forts, and block printing crafts.",
    smartAdvice: "☀️ Golden Season. November brings bright sunny days but crisp, cool evenings. Highly comfortable for exploring fort ramparts without excessive heat."
  },
  {
    id: "varanasi",
    name: "Varanasi",
    description: "One of the oldest living cities, spiritual heart of India on the banks of Ganges.",
    smartAdvice: "☀️ Dev Deepawali Highlight. Beautiful cooler climate perfect for Ghat walking. Highly recommended to attend the Evening Aarti from a private motorboat."
  }
];

const hotels: Hotel[] = [
  // Agra
  {
    id: "h-agra-1",
    name: "The Comfort Inn Suites",
    distance: "0.5 miles from Taj Mahal East Gate",
    rating: 4.7,
    tags: ["Elevator Access", "Senior Friendly", "Free Breakfast"],
    price: 145,
    originalPrice: 180,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_xzQBe9wtMfMUb5wQLeaZHIgCswKVajJLIkQuzFxQzhbIhDg-XBs0Z7fha0Qk_fMCMVUE-LLJZp49z6vfnx6jv0i_Ea67EXQevVjf3X1J2EI6t86uS8qiyPsHr8Hv69zkMl9u78Bmoh3NGC3R19-FSI1IuyTeTlDNCz0syz9NiOrTQA6_DdnscagtAcwna-a2NvBB9gbV6jOThaBsquMLjmWYlM3yI7h_DSDeJ6y1xK0ZQIIWq7QVVw",
    category: "Best Value",
    description: "A serene, well-equipped hotel offering ramps, wide corridors, spacious bathroom support grips, and quiet environment ideal for a premium and peaceful stay."
  },
  {
    id: "h-agra-2",
    name: "Blue Harbor Lodge",
    distance: "1.2 miles from Taj Mahal West Gate",
    rating: 4.5,
    tags: ["Valet Parking", "Walk-in Showers", "Doctor on Call"],
    price: 120,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDj0m2AaL-CKfUReZ4bdVYxDjyYVj0o7SJvwz3-VRpxuBrHOMcRW3wENsTfY2PBqfhiZp2khm1NJjI34BhIy7aNxondNOTvDkmETwWw8fFvlls2GJav_wP0G18v3gt6PlirJfHu1dOYl6a8nXnc3tLCBQ9mEEQW847lbtZNEMXwrG6xSSM-k3d3kHdC8sTOFtjIjtp5H3Ao6TLieeUB5Ln_DZaka6M1cXz26jx0NUiyvQcCfAxZk0RbPA",
    category: "Best Value",
    description: "Warm, cozy, modern lobby seating, low step entry, and direct shuttle to the historical gates."
  },
  {
    id: "h-agra-3",
    name: "The Oberoi Amarvilas Luxury Resort",
    distance: "300 meters from Taj Mahal",
    rating: 4.9,
    tags: ["Golf Cart Transit", "Taj Mahal View", "Butler Service"],
    price: 450,
    originalPrice: 550,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_xzQBe9wtMfMUb5wQLeaZHIgCswKVajJLIkQuzFxQzhbIhDg-XBs0Z7fha0Qk_fMCMVUE-LLJZp49z6vfnx6jv0i_Ea67EXQevVjf3X1J2EI6t86uS8qiyPsHr8Hv69zkMl9u78Bmoh3NGC3R19-FSI1IuyTeTlDNCz0syz9NiOrTQA6_DdnscagtAcwna-a2NvBB9gbV6jOThaBsquMLjmWYlM3yI7h_DSDeJ6y1xK0ZQIIWq7QVVw",
    category: "Luxury Stays",
    description: "Iconic luxury property. Every single room offers an uninterrupted view of the Taj Mahal. Fully accessible golf carts take you directly to the monument ticketing area."
  },

  // Jaipur
  {
    id: "h-jaipur-1",
    name: "Heritage Palace Court",
    distance: "1.0 miles from City Palace",
    rating: 4.6,
    tags: ["Elevator Access", "Heritage Courtyard", "Complimentary Tea"],
    price: 110,
    originalPrice: 140,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDj0m2AaL-CKfUReZ4bdVYxDjyYVj0o7SJvwz3-VRpxuBrHOMcRW3wENsTfY2PBqfhiZp2khm1NJjI34BhIy7aNxondNOTvDkmETwWw8fFvlls2GJav_wP0G18v3gt6PlirJfHu1dOYl6a8nXnc3tLCBQ9mEEQW847lbtZNEMXwrG6xSSM-k3d3kHdC8sTOFtjIjtp5H3Ao6TLieeUB5Ln_DZaka6M1cXz26jx0NUiyvQcCfAxZk0RbPA",
    category: "Best Value",
    description: "Charming traditional palace converted into a comfortable guest stay with modern elevator installations and quiet evening puppet shows."
  },
  {
    id: "h-jaipur-2",
    name: "Rambagh Palace Hotel",
    distance: "2.5 miles from Hawa Mahal",
    rating: 4.9,
    tags: ["Royal Gardens", "Imperial Spa", "Wheelchair Friendly Ramps"],
    price: 490,
    originalPrice: 600,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_xzQBe9wtMfMUb5wQLeaZHIgCswKVajJLIkQuzFxQzhbIhDg-XBs0Z7fha0Qk_fMCMVUE-LLJZp49z6vfnx6jv0i_Ea67EXQevVjf3X1J2EI6t86uS8qiyPsHr8Hv69zkMl9u78Bmoh3NGC3R19-FSI1IuyTeTlDNCz0syz9NiOrTQA6_DdnscagtAcwna-a2NvBB9gbV6jOThaBsquMLjmWYlM3yI7h_DSDeJ6y1xK0ZQIIWq7QVVw",
    category: "Luxury Stays",
    description: "The jewel of Jaipur. Extravagant peacock gardens, flawless flat gravel walk pathways, and historically preserved heritage elevators and lounges."
  },

  // Varanasi
  {
    id: "h-varanasi-1",
    name: "Ganges Serenity Riverview",
    distance: "0.2 miles from Assi Ghat",
    rating: 4.7,
    tags: ["River Terrace", "Elevator Installed", "Senior Yoga Sessions"],
    price: 130,
    originalPrice: 165,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDj0m2AaL-CKfUReZ4bdVYxDjyYVj0o7SJvwz3-VRpxuBrHOMcRW3wENsTfY2PBqfhiZp2khm1NJjI34BhIy7aNxondNOTvDkmETwWw8fFvlls2GJav_wP0G18v3gt6PlirJfHu1dOYl6a8nXnc3tLCBQ9mEEQW847lbtZNEMXwrG6xSSM-k3d3kHdC8sTOFtjIjtp5H3Ao6TLieeUB5Ln_DZaka6M1cXz26jx0NUiyvQcCfAxZk0RbPA",
    category: "Best Value",
    description: "Overlooks the holy river Ganges with a secure rooftop lift, warm vegetarian breakfasts, and special morning chanting sessions."
  },
  {
    id: "h-varanasi-2",
    name: "Taj Nadesar Palace",
    distance: "3.5 miles from Dasaswamedh Ghat",
    rating: 4.9,
    tags: ["Historic Carriage Rides", "Private Orchard Walks", "Doctor On-site"],
    price: 480,
    originalPrice: 580,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_xzQBe9wtMfMUb5wQLeaZHIgCswKVajJLIkQuzFxQzhbIhDg-XBs0Z7fha0Qk_fMCMVUE-LLJZp49z6vfnx6jv0i_Ea67EXQevVjf3X1J2EI6t86uS8qiyPsHr8Hv69zkMl9u78Bmoh3NGC3R19-FSI1IuyTeTlDNCz0syz9NiOrTQA6_DdnscagtAcwna-a2NvBB9gbV6jOThaBsquMLjmWYlM3yI7h_DSDeJ6y1xK0ZQIIWq7QVVw",
    category: "Luxury Stays",
    description: "Nestled amidst 40 acres of lush mango orchards and jasmine gardens. Unbelievably peaceful, offering completely flat, wide brick walkways perfect for strolls."
  }
];

const activities: Activity[] = [
  // Agra
  {
    id: "act-agra-1",
    name: "Grand Taj Mahal Landmark",
    type: "landmark",
    category: "Visit",
    timeNeeded: "2-3 hours",
    description: "An architectural masterpiece of white marble. Senior-friendly electric cart transport runs directly from the parking area to the entrance gates.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOuaaDofBRbtUmkPNYGrzPUkR6nTxdboHByA-WHGBPAgHwfCM_FNt31rpGdkXckTdBLd3hYqwSNOSTOrG-M-rpIOAiCp2qm9Y_khThclz5mdk3dTaXYF5Job2k5GNrO1EP7FBWtPXBmxYktKmzTnzf5cg6qK0QQbdGqfdP-gvajCHGFgVNUl0FKfqTeP6F4cbVwCCBnlJRYLLiatlJhhqYXBxh6V1fiTiaKn1FGZ138Qjqc6xGdMxC_Q",
    easyWalking: true,
  },
  {
    id: "act-agra-2",
    name: "Mehtab Bagh Royal Gardens",
    type: "landmark",
    category: "Leisure",
    timeNeeded: "1-1.5 hours",
    description: "Beautifully symmetrical botanical moonlight gardens directly opposite the Taj Mahal. Wide level stone pathways with zero stairs and comfortable sitting benches.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL1C5H65TV_MCp0aJWOUQ6JtZE6Uw7FP0MAYcSm1UeGZgr5dQq9fSuvdsi9gcQWqwY8z5w8sAa4jWIc_YcbJMsU6kfe7RHZAQpycNMFjKoMbTVMAaEKkSYsi8iRymyd05AgfebLDGAFZ36ZA406xmnZhizKX1Nd5h5w7cr4v6zE-iedfk-8ZfKqCtS_VNFuqUgErvm6lHA2yDCwWsdMTEm0QkSvOQS-hTuKSjW7lXQksGy9b47W4GaGg",
    easyWalking: true,
  },

  // Jaipur
  {
    id: "act-jaipur-1",
    name: "Jaipur City Palace Complex",
    type: "landmark",
    category: "Visit",
    timeNeeded: "2 hours",
    description: "The grand royal residence showcasing heritage architecture, textiles, and weapons. Ramps have been built around core courtyards, very easy to traverse.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOuaaDofBRbtUmkPNYGrzPUkR6nTxdboHByA-WHGBPAgHwfCM_FNt31rpGdkXckTdBLd3hYqwSNOSTOrG-M-rpIOAiCp2qm9Y_khThclz5mdk3dTaXYF5Job2k5GNrO1EP7FBWtPXBmxYktKmzTnzf5cg6qK0QQbdGqfdP-gvajCHGFgVNUl0FKfqTeP6F4cbVwCCBnlJRYLLiatlJhhqYXBxh6V1fiTiaKn1FGZ138Qjqc6xGdMxC_Q",
    easyWalking: true,
  },
  {
    id: "act-jaipur-2",
    name: "Sisodia Rani Royal Gardens",
    type: "landmark",
    category: "Leisure",
    timeNeeded: "1.5 hours",
    description: "Lush multi-tiered royal gardens featuring historic wall frescoes, water fountains, and flat terrace walkways surrounded by quiet green hills.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL1C5H65TV_MCp0aJWOUQ6JtZE6Uw7FP0MAYcSm1UeGZgr5dQq9fSuvdsi9gcQWqwY8z5w8sAa4jWIc_YcbJMsU6kfe7RHZAQpycNMFjKoMbTVMAaEKkSYsi8iRymyd05AgfebLDGAFZ36ZA406xmnZhizKX1Nd5h5w7cr4v6zE-iedfk-8ZfKqCtS_VNFuqUgErvm6lHA2yDCwWsdMTEm0QkSvOQS-hTuKSjW7lXQksGy9b47W4GaGg",
    easyWalking: true,
  },

  // Varanasi
  {
    id: "act-varanasi-1",
    name: "Dashashwamedh Aarti Ghat",
    type: "landmark",
    category: "Visit",
    timeNeeded: "2 hours",
    description: "The spectacular evening Ganga Aarti. We arrange custom, comfortable seats on secure anchored double-deck riverboats, avoiding steep crowded stairs entirely.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOuaaDofBRbtUmkPNYGrzPUkR6nTxdboHByA-WHGBPAgHwfCM_FNt31rpGdkXckTdBLd3hYqwSNOSTOrG-M-rpIOAiCp2qm9Y_khThclz5mdk3dTaXYF5Job2k5GNrO1EP7FBWtPXBmxYktKmzTnzf5cg6qK0QQbdGqfdP-gvajCHGFgVNUl0FKfqTeP6F4cbVwCCBnlJRYLLiatlJhhqYXBxh6V1fiTiaKn1FGZ138Qjqc6xGdMxC_Q",
    easyWalking: false,
  },
  {
    id: "act-varanasi-2",
    name: "Sarnath Deer Park & Stupa",
    type: "landmark",
    category: "Leisure",
    timeNeeded: "2.5 hours",
    description: "An incredibly tranquil historic Buddhist park 10km outside the city. Beautiful wide tree-lined level asphalt paths, fresh air, and lovely sitting spots.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL1C5H65TV_MCp0aJWOUQ6JtZE6Uw7FP0MAYcSm1UeGZgr5dQq9fSuvdsi9gcQWqwY8z5w8sAa4jWIc_YcbJMsU6kfe7RHZAQpycNMFjKoMbTVMAaEKkSYsi8iRymyd05AgfebLDGAFZ36ZA406xmnZhizKX1Nd5h5w7cr4v6zE-iedfk-8ZfKqCtS_VNFuqUgErvm6lHA2yDCwWsdMTEm0QkSvOQS-hTuKSjW7lXQksGy9b47W4GaGg",
    easyWalking: true,
  }
];

// Combine mock active gems
let activeApprovedGems: Activity[] = [
  {
    id: "approved-gem-1",
    name: "Old Town Roasters Cafe",
    type: "gem",
    category: "Lunch",
    timeNeeded: "1.5 hours",
    description: "A charming, quiet traditional cafe tucked away from crowds. Fully accessible ground floor with comfortable high chairs, perfect pastries, and warm coffee.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0knllOYAYIkCHOJh-nyf_JKLn0nAcJeRBVtNwS8H6G9GXcfAltZDayM7eptMrMzvmkvxFidY9BzdxtEsj_3PqlTQ77X6tT0UOLXcaYQEWMchcD7Isw5sDgFPpzPCWpPXoptFlLt1HsN-L9SihXmR9DeMf_0KciTOsUXFgi_bOI6hwRjbVJiqjcsCsW2OBhEoVggWDd0j_iWwOHVm0FlauMoJzx5XvfomQhEFyuUA_dld9xQbvJVGkTA",
    localFavorite: true,
  }
];

// Lazy initialize Gemini client safely
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// REST API Endpoints

// 1. Core Config and Settings
app.get("/api/destinations", (req, res) => {
  res.json(destinations);
});

app.get("/api/hotels", (req, res) => {
  const destId = req.query.destinationId as string;
  if (destId) {
    const matched = hotels.filter(h => h.id.includes(destId));
    res.json(matched);
  } else {
    res.json(hotels);
  }
});

app.get("/api/activities", (req, res) => {
  const destId = req.query.destinationId as string;
  let list = [...activities];
  if (destId) {
    list = list.filter(a => a.id.includes(destId));
    // Append approved user-submitted gems for this location if matched
    const matchedGems = activeApprovedGems.filter(g => g.id.includes(destId) || destId === "agra");
    list = [...list, ...matchedGems];
  } else {
    list = [...list, ...activeApprovedGems];
  }
  res.json(list);
});

// 2. Admin APIs
app.get("/api/admin/settings", (req, res) => {
  res.json(adminSettings);
});

app.post("/api/admin/settings", (req, res) => {
  adminSettings = { ...adminSettings, ...req.body };
  res.json({ success: true, settings: adminSettings });
});

app.get("/api/admin/broadcasts", (req, res) => {
  res.json(broadcasts);
});

app.post("/api/admin/broadcast", (req, res) => {
  const { type, content } = req.body;
  if (!type || !content) {
    return res.status(400).json({ error: "Type and content are required" });
  }
  const newBroadcast: BroadcastMessage = {
    id: "b" + Date.now(),
    type,
    content,
    active: true,
    timestamp: new Date().toISOString()
  };
  broadcasts.unshift(newBroadcast);
  res.json({ success: true, broadcast: newBroadcast });
});

app.post("/api/admin/dismiss-broadcast", (req, res) => {
  const { id } = req.body;
  broadcasts = broadcasts.map(b => b.id === id ? { ...b, active: false } : b);
  res.json({ success: true });
});

app.get("/api/admin/pending-gems", (req, res) => {
  res.json(pendingGems);
});

app.post("/api/admin/approve-gem", (req, res) => {
  const { id } = req.body;
  const gemIndex = pendingGems.findIndex(g => g.id === id);
  if (gemIndex > -1) {
    const gem = pendingGems[gemIndex];
    // Create actual active Activity
    const newActivity: Activity = {
      id: "approved-gem-" + Date.now() + "-" + gem.id,
      name: gem.name,
      type: "gem",
      category: "Lunch",
      timeNeeded: "1.5 hours",
      description: gem.description,
      image: gem.image,
      localFavorite: true,
    };
    activeApprovedGems.push(newActivity);
    pendingGems.splice(gemIndex, 1);
    res.json({ success: true, approvedGem: newActivity });
  } else {
    res.status(404).json({ error: "Pending gem not found" });
  }
});

app.post("/api/admin/reject-gem", (req, res) => {
  const { id } = req.body;
  pendingGems = pendingGems.filter(g => g.id !== id);
  res.json({ success: true });
});

app.get("/api/admin/campaigns", (req, res) => {
  res.json(adCampaigns);
});

app.post("/api/admin/campaign", (req, res) => {
  const { title, campaignType, placement, affiliateLink, imageDescription } = req.body;
  if (!title || !affiliateLink) {
    return res.status(400).json({ error: "Title and affiliate link are required" });
  }

  // Deactivate others on same placement
  adCampaigns = adCampaigns.map(c => c.placement === placement ? { ...c, active: false } : c);

  const newCampaign: AdCampaign = {
    id: "ad" + Date.now(),
    title,
    campaignType: campaignType || "Affiliate",
    placement: placement || "Top Banner",
    affiliateLink,
    imageDescription: imageDescription || "Sponsored advertisement placement.",
    active: true,
  };
  adCampaigns.unshift(newCampaign);
  res.json({ success: true, campaign: newCampaign });
});

// 3. User submission of raw gems to show pending gems flow!
app.post("/api/user/submit-gem", (req, res) => {
  const { name, location, description, submittedBy } = req.body;
  if (!name || !location || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newPending: PendingHiddenGem = {
    id: "pg" + Date.now(),
    name,
    location,
    submittedBy: submittedBy || "Anonymous Traveler",
    description,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0knllOYAYIkCHOJh-nyf_JKLn0nAcJeRBVtNwS8H6G9GXcfAltZDayM7eptMrMzvmkvxFidY9BzdxtEsj_3PqlTQ77X6tT0UOLXcaYQEWMchcD7Isw5sDgFPpzPCWpPXoptFlLt1HsN-L9SihXmR9DeMf_0KciTOsUXFgi_bOI6hwRjbVJiqjcsCsW2OBhEoVggWDd0j_iWwOHVm0FlauMoJzx5XvfomQhEFyuUA_dld9xQbvJVGkTA",
  };
  pendingGems.unshift(newPending);
  res.json({ success: true, pendingGem: newPending });
});

// 4. Gemini AI Integrations
app.post("/api/gemini/travel-expert", async (req, res) => {
  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  // Format conversational context
  const conversationHistory = messages.map(m => `${m.sender === "user" ? "User" : "Travel Expert"}: ${m.text}`).join("\n");
  const systemInstruction = `You are an elite, highly empathetic, senior-friendly Travel Expert buddy. Your persona is a "Wise Companion"—knowledgeable, steady, extremely patient, and clear. 
Always recommend accessible, senior-friendly paths (low steps, resting benches, elevator access). Keep replies highly clear, structured, and easy to read with short paragraphs and visual spacing. No medical advice, just reliable travel options.
Current context of active trip planning: ${JSON.stringify(context || {})}.`;

  const prompt = `Here is the current conversation history with the user:\n${conversationHistory}\n\nExpert, respond to the last User message beautifully. Keep your answer practical, comforting, and specific to their selected city or query. Do not exceed 150 words.`;

  try {
    const client = getAIClient();
    if (client) {
      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      res.json({ text: response.text });
    } else {
      // Offline / No-Key Simulation
      // Simple smart rule based matching for immediate, beautiful responsiveness
      const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || "";
      let simulatedReply = "That sounds like a wonderful plan! In Agra, I highly suggest using the electric shuttle cart service right from the East Gate parking. It's fully accessible and saves a 1km walk in the sun. Is there anything specific about accessible ramps or restaurants you'd like me to look up?";
      if (lastMsg.includes("hotel") || lastMsg.includes("stay")) {
        simulatedReply = "Choosing the right stay is so important! For comfortable, senior-friendly lodging, look for properties like The Comfort Inn Suites which feature wider doorways, support grips, and roll-in showers. Would you like me to detail its best accessibility features?";
      } else if (lastMsg.includes("diwali") || lastMsg.includes("festival")) {
        simulatedReply = "Diwali is truly breathtaking! In Varanasi, Dev Deepawali lit Ghats are spectacular. We highly recommend booking a private double-decker motorboat. This keeps you perfectly safe from crowded stairwells and offers an unmatched view of the golden floating oil lamps. Shall I find the best dock for boarding?";
      } else if (lastMsg.includes("weather") || lastMsg.includes("best time")) {
        simulatedReply = "November is absolute gold for travel in North India! The heat of summer is entirely gone, leaving clear, crisp blue skies and comfortable daytime temperatures of around 24°C (75°F). Do you have warm cardigans ready for cooler evenings?";
      }
      setTimeout(() => {
        res.json({ text: simulatedReply });
      }, 800);
    }
  } catch (error: any) {
    console.error("Gemini Travel Expert error:", error);
    res.json({ text: "I apologize, my connection to the travel database fluctuated briefly. For your comfort, I recommend focusing on places with level walkways and accessible golf cart shuttles. What city or landmark shall we review next?" });
  }
});

app.post("/api/gemini/smart-advice", async (req, res) => {
  const { destinationName, dateText } = req.body;
  if (!destinationName) {
    return res.status(400).json({ error: "Destination name is required" });
  }

  const prompt = `Provide 1-2 sentence travel advisory for ${destinationName} during ${dateText || "November 2026"}. Keep it senior-focused, positive, clear, and note major festivals or great weather advice. Highlight if it's high season.`;

  try {
    const client = getAIClient();
    if (client) {
      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a senior-friendly travel expert. Write a concise 2-sentence piece of smart advice.",
          temperature: 0.5,
        }
      });
      res.json({ text: response.text });
    } else {
      let advice = `☀️ Perfect Climate! November offers clear blue skies and pleasant cooler air, ideal for exploring Agra's majestic courts. Perfect season for senior travelers.`;
      if (destinationName.toLowerCase().includes("jaipur")) {
        advice = `☀️ Golden Season! November brings bright sunny days but crisp, cool evenings. Highly comfortable for exploring fort ramparts without excessive heat.`;
      } else if (destinationName.toLowerCase().includes("varanasi")) {
        advice = `☀️ Dev Deepawali Highlight! Beautiful cooler climate perfect for Ghat walking. Highly recommended to attend the evening Aarti from a private motorboat.`;
      }
      res.json({ text: advice });
    }
  } catch (err) {
    res.json({ text: `☀️ Pleasant Season. November offers clear skies and comfortable afternoon temperatures of around 24°C, highly suitable for sight-seeing.` });
  }
});

// Dynamic Real-Time All-World Places & Weather Discovery API
app.post("/api/gemini/discover-destination", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Destination name is required" });
  }

  const cleanName = name.trim();
  const searchKey = cleanName.toLowerCase();

  // 1. High-fidelity Local Curated Database Check
  const curatedDestinations: Record<string, any> = {
    kyoto: {
      destination: {
        id: "kyoto",
        name: "Kyoto",
        description: "Japan's cultural heart, famous for thousands of classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.",
        smartAdvice: "🌸 Highly peaceful! Kyoto features extremely polite hospitality, quiet flat temple pathways, and beautiful stroller/wheelchair accessible routes around Kiyomizu-dera."
      },
      hotels: [
        {
          id: "h-kyoto-1",
          name: "Kyoto Royal Park Hotel",
          distance: "0.2 miles from Gion District",
          rating: 4.8,
          tags: ["Elevator Access", "English Speaking Support", "Wheelchair Ramps"],
          price: 185,
          image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
          category: "Best Value",
          description: "A serene sanctuary located in downtown Kyoto. Offers spacious level-access baths, extremely comfortable supportive bedding, and beautiful Zen garden views."
        },
        {
          id: "h-kyoto-2",
          name: "Sowaka Luxury Ryokan",
          distance: "0.5 miles from Yasaka Shrine",
          rating: 4.9,
          tags: ["Private Onsen", "Garden Pathways", "Ground Floor Suites"],
          price: 480,
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
          category: "Luxury Stays",
          description: "An ultra-premium restored traditional ryokan. Offers custom-designed walk-in handrails, beautiful flat tatami flooring suited for gentle pacing, and Michelin-rated fine dining."
        }
      ],
      activities: [
        {
          id: "act-kyoto-1",
          name: "Kinkaku-ji (The Golden Pavilion)",
          type: "landmark",
          category: "Visit",
          timeNeeded: "1.5 hours",
          description: "Stunning Zen temple covered in brilliant gold leaf. The surrounding circular garden walkway is fully gravel-paved with ramp detours for easy strolls.",
          image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80",
          easyWalking: true
        },
        {
          id: "act-kyoto-2",
          name: "Arashiyama Bamboo Grove Walk",
          type: "landmark",
          category: "Leisure",
          timeNeeded: "2 hours",
          description: "A peaceful path leading through thousands of soaring green bamboo stalks. Extremely smooth, flat paved walkways with comfortable resting benches.",
          image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
          easyWalking: true
        }
      ],
      weather: {
        temp: "17°C",
        condition: "Partly Cloudy",
        icon: "cloudy",
        packingAdvice: "Pleasant mild weather. Suggest packing a comfortable light jacket, supportive sneakers, and a pocket umbrella for sudden showers.",
        forecast: [
          { day: "Tomorrow", temp: "18°C", cond: "Sunny" },
          { day: "Day 2", temp: "16°C", cond: "Showers" },
          { day: "Day 3", temp: "17°C", cond: "Clear" }
        ]
      }
    },
    paris: {
      destination: {
        id: "paris",
        name: "Paris",
        description: "The global center for art, fashion, gastronomy, and historic culture situated along the river Seine.",
        smartAdvice: "🗼 Beautiful Atmosphere! Extremely walkable historic boulevards. Suggest utilizing the modern flat-level bus system which is senior-friendly and offers views of the landmarks."
      },
      hotels: [
        {
          id: "h-paris-1",
          name: "Hôtel Regina Louvre",
          distance: "0.1 miles from Louvre Museum",
          rating: 4.8,
          tags: ["Elevator Access", "Spacious Bathrooms", "Doctor on Call"],
          price: 240,
          image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
          category: "Best Value",
          description: "A classical Parisian hotel with wide vintage elevators, premium handrails, and a highly quiet atmosphere overlooking the Tuileries gardens."
        },
        {
          id: "h-paris-2",
          name: "Le Meurice Palace",
          distance: "0.3 miles from Place de la Concorde",
          rating: 4.9,
          tags: ["Wheelchair Accessible", "Michelin Dining", "Luxury Concierge"],
          price: 520,
          image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80",
          category: "Luxury Stays",
          description: "An elegant masterpiece combining 18th-century opulence with state-of-the-art modern step-free entries, lift corridors, and full butler care."
        }
      ],
      activities: [
        {
          id: "act-paris-1",
          name: "Seine River Cruise (Bateaux Parisiens)",
          type: "landmark",
          category: "Leisure",
          timeNeeded: "1.5 hours",
          description: "Relax on a premium, climate-controlled level glass boat. Glides past Eiffel Tower, Notre Dame, and Louvre with comfortable seating and zero walking required.",
          image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80",
          easyWalking: true
        },
        {
          id: "act-paris-2",
          name: "Jardin du Luxembourg",
          type: "landmark",
          category: "Leisure",
          timeNeeded: "1.5 hours",
          description: "Quiet gravel walkways flanked by statues, fountains, and beautiful flowerbeds. Hundreds of green metal chairs to sit and enjoy the warm breeze.",
          image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
          easyWalking: true
        }
      ],
      weather: {
        temp: "19°C",
        condition: "Pleasant & Clear",
        icon: "sunny",
        packingAdvice: "Beautiful, clear afternoon conditions. An elegant cardigan, light scarf, and comfortable flat leather walking shoes are recommended.",
        forecast: [
          { day: "Tomorrow", temp: "20°C", cond: "Sunny" },
          { day: "Day 2", temp: "19°C", cond: "Partly Cloudy" },
          { day: "Day 3", temp: "18°C", cond: "Mild Rain" }
        ]
      }
    },
    rome: {
      destination: {
        id: "rome",
        name: "Rome",
        description: "A sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture, and culture on display.",
        smartAdvice: "🏛️ Ancient Magic! Ancient cobblestones can be uneven. Focus on flat accessible paths around the Pantheon and beautiful smooth museum interiors with elevators."
      },
      hotels: [
        {
          id: "h-rome-1",
          name: "Hotel Quirinale",
          distance: "0.2 miles from Opera House",
          rating: 4.7,
          tags: ["Elevator Access", "Quiet Courtyard", "Flat Lobby Entrance"],
          price: 160,
          image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
          category: "Best Value",
          description: "Featuring a serene, private courtyard garden with completely flat paths, step-free lifts, and classic antique decorations in highly comfortable rooms."
        },
        {
          id: "h-rome-2",
          name: "Rocco Forte Hotel de la Ville",
          distance: "0.1 miles from Spanish Steps",
          rating: 4.9,
          tags: ["Ramp Accessible", "Luxe Spa", "Senior Support Staff"],
          price: 490,
          image: "https://images.unsplash.com/photo-1529260830199-445829ec141e?auto=format&fit=crop&w=600&q=80",
          category: "Luxury Stays",
          description: "Located on top of the Spanish Steps with an accessible street-level side entry, elevator access to panoramic terrace dining, and top-tier senior travel advisors."
        }
      ],
      activities: [
        {
          id: "act-rome-1",
          name: "The Pantheon Dome",
          type: "landmark",
          category: "Visit",
          timeNeeded: "1 hour",
          description: "Magnificent ancient temple with a smooth flat marble floor, wide step-free entrance portal, and plenty of light. Incredibly easy to tour inside.",
          image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
          easyWalking: true
        },
        {
          id: "act-rome-2",
          name: "Villa Borghese Gardens Train",
          type: "landmark",
          category: "Leisure",
          timeNeeded: "1.5 hours",
          description: "Board the miniature electric tourist train. It winds smoothly through the shaded historic oak tree pathways of Rome's most elegant public park.",
          image: "https://images.unsplash.com/photo-1529260830199-445829ec141e?auto=format&fit=crop&w=600&q=80",
          easyWalking: true
        }
      ],
      weather: {
        temp: "23°C",
        condition: "Sunny & Warm",
        icon: "sunny",
        packingAdvice: "Very comfortable warmth. Wear a light linen shirt, sun hat, sunglasses, and have a refillable water bottle for Rome's historic cold-water fountains.",
        forecast: [
          { day: "Tomorrow", temp: "24°C", cond: "Sunny" },
          { day: "Day 2", temp: "22°C", cond: "Clear" },
          { day: "Day 3", temp: "23°C", cond: "Partly Cloudy" }
        ]
      }
    }
  };

  // Match curated keys
  for (const key of Object.keys(curatedDestinations)) {
    if (searchKey.includes(key) || key.includes(searchKey)) {
      console.log(`[Discover Destination] Matched Curated key: ${key}`);
      return res.json(curatedDestinations[key]);
    }
  }

  // 2. Dynamic Real-Time Gemini AI Generation
  try {
    const client = getAIClient();
    if (client) {
      const systemInstruction = `You are an elite real-time global travel planner and discoverer.
Your purpose is to look up the actual, real-world current weather, hotels, and tourist attractions for any requested global city.
All hotel listings and sightseeing recommendations MUST be specifically customized with premium senior travel accessibility features (such as level ground walking, step-free access, wheelchair availability, medical aid nearby, elevators).
Your output must be returned strictly as a single valid JSON object. No markdown syntax wrapper, no trailing backticks. Ensure valid JSON structure matching:
{
  "destination": {
    "id": "string (lowercase, alphanumeric ID)",
    "name": "string (proper City Name)",
    "description": "string (charming city intro, 15-20 words)",
    "smartAdvice": "string (senior accessibility advice, 15-20 words)"
  },
  "hotels": [
    {
      "id": "h-custom-1",
      "name": "string (actual real-world senior friendly hotel name)",
      "distance": "string (distance from city landmark)",
      "rating": 4.8,
      "tags": ["Elevator", "Doctor on Call", "Grab Bars"],
      "price": 160,
      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      "category": "Best Value",
      "description": "string (accessible features detailed)"
    },
    {
      "id": "h-custom-2",
      "name": "string (actual real luxury hotel name)",
      "distance": "string (distance from key site)",
      "rating": 4.9,
      "tags": ["Wheelchair Friendly Ramps", "Step-free Entry", "24/7 Butler"],
      "price": 420,
      "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
      "category": "Luxury Stays",
      "description": "string (lavish senior accessibility comfort details)"
    }
  ],
  "activities": [
    {
      "id": "act-custom-1",
      "name": "string (real tourist monument/place name)",
      "type": "landmark",
      "category": "Visit",
      "timeNeeded": "2 hours",
      "description": "string (elderly-focused level ground description)",
      "image": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
      "easyWalking": true
    },
    {
      "id": "act-custom-2",
      "name": "string (real gorgeous public park or temple name)",
      "type": "landmark",
      "category": "Leisure",
      "timeNeeded": "1.5 hours",
      "description": "string (wheelchair ramp pathways & plenty of seating benches detailed)",
      "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      "easyWalking": true
    }
  ],
  "weather": {
    "temp": "string (e.g. 21°C)",
    "condition": "string (e.g. Sunny & Warm)",
    "icon": "sunny",
    "packingAdvice": "string (detailed packing guidance for seniors)",
    "forecast": [
      { "day": "Tomorrow", "temp": "22°C", "cond": "Sunny" },
      { "day": "Day 2", "temp": "20°C", "cond": "Partly Cloudy" },
      { "day": "Day 3", "temp": "21°C", "cond": "Clear" }
    ]
  }
}
Note: For icon, select exactly one of: "sunny", "cloudy", "rainy", "windy", "snowy", "foggy". Use highly relevant placeholder links for hotel/activities images.`;

      const prompt = `Discover the global destination: "${cleanName}". Please use Google Search to look up the actual, real-world current weather forecast, real-world hotels currently operating there, and real-world landmark attractions. Map these real-world search findings into the required JSON schema.`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
        }
      });

      const parsed = JSON.parse(response.text.trim());
      
      // Inject high-fidelity dynamic Unsplash images so they look absolutely real-time and magnificent
      if (parsed.hotels) {
        parsed.hotels[0].image = `https://images.unsplash.com/featured/?hotel,${encodeURIComponent(cleanName)}`;
        parsed.hotels[1].image = `https://images.unsplash.com/featured/?resort,${encodeURIComponent(cleanName)}`;
      }
      if (parsed.activities) {
        parsed.activities[0].image = `https://images.unsplash.com/featured/?landmark,${encodeURIComponent(cleanName)}`;
        parsed.activities[1].image = `https://images.unsplash.com/featured/?park,${encodeURIComponent(cleanName)}`;
      }

      console.log(`[Discover Destination] Dynamic Gemini Generation successful for: ${cleanName}`);
      return res.json(parsed);
    }
  } catch (apiErr) {
    console.error("Gemini Discover Destination failed, shifting to custom generator:", apiErr);
  }

  // 3. Fallback Dynamic Generator
  const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const lowercaseId = cleanName.toLowerCase().replace(/\s+/g, "-");

  const fallbackData = {
    destination: {
      id: lowercaseId,
      name: formattedName,
      description: `Welcome to ${formattedName}, a magnificent global center of history, scenery, and rich local hospitality.`,
      smartAdvice: `☀️ Pleasant Season! Visiting ${formattedName} is wonderfully comfortable currently. We suggest flat-level sightseeing tours and resting as needed.`
    },
    hotels: [
      {
        id: `h-${lowercaseId}-1`,
        name: `The ${formattedName} Central Grand Hotel`,
        distance: "0.4 miles from historic main square",
        rating: 4.8,
        tags: ["Elevator Access", "Ramps Built", "On-site Medical Aid"],
        price: 155,
        image: `https://images.unsplash.com/featured/?hotel,luxury,${encodeURIComponent(cleanName)}`,
        category: "Best Value" as const,
        description: `Highly comfortable accommodations in ${formattedName} featuring flat lobby entrances, modern elevator installations, wide shower doors, and top hospitality.`
      },
      {
        id: `h-${lowercaseId}-2`,
        name: `The ${formattedName} Sovereign Palace & Spa`,
        distance: "0.1 miles from peaceful botanical park",
        rating: 4.9,
        tags: ["Wheelchair Friendly Ramps", "Step-free Corridors", "Personal Chauffeur"],
        price: 430,
        image: `https://images.unsplash.com/featured/?resort,${encodeURIComponent(cleanName)}`,
        category: "Luxury Stays" as const,
        description: `A pristine luxury experience featuring beautiful level brick walkways, step-free access to heated pools, dedicated accessibility support team, and butler services.`
      }
    ],
    activities: [
      {
        id: `act-${lowercaseId}-1`,
        name: `The Great ${formattedName} Botanical Gardens`,
        type: "landmark" as const,
        category: "Leisure" as const,
        timeNeeded: "2 hours",
        description: `Winding garden trails featuring exceptionally smooth flat-paved concrete pathways, tall shaded old oak trees, comfortable wood seating benches, and fresh air.`,
        image: `https://images.unsplash.com/featured/?garden,park,${encodeURIComponent(cleanName)}`,
        easyWalking: true
      },
      {
        id: `act-${lowercaseId}-2`,
        name: `The Old Town Heritage Promenade`,
        type: "landmark" as const,
        category: "Visit" as const,
        timeNeeded: "1.5 hours",
        description: `Stroll down the beautifully preserved flat paved street lined with traditional craft shops, artisan bakeries, and comfortable outdoor cafes with low-step entry.`,
        image: `https://images.unsplash.com/featured/?landmark,monument,${encodeURIComponent(cleanName)}`,
        easyWalking: true
      }
    ],
    weather: {
      temp: "21°C",
      condition: "Partly Cloudy",
      icon: "cloudy",
      packingAdvice: "Wonderfully balanced temperatures. Pack a warm shawl or light jacket for breezy evenings, supportive orthopedic walking shoes, and thin clothing layers.",
      forecast: [
        { day: "Tomorrow", temp: "22°C", cond: "Sunny" },
        { day: "Day 2", temp: "20°C", cond: "Mild Showers" },
        { day: "Day 3", temp: "21°C", cond: "Clear & Calm" }
      ]
    }
  };

  console.log(`[Discover Destination] Dynamic Fallback Generation successful for: ${cleanName}`);
  res.json(fallbackData);
});


// Bootstrapping Server/Vite Integrations
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Travel Buddy Server] Running on http://localhost:${PORT}`);
  });
}

start();
