```typescript
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BCRoadTripPlanner = () => {
  // State definitions (unchanged from previous version)
  const [currentUser, setCurrentUser] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentSection, setCurrentSection] = useState('overview');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState([
    { id: 1, description: "RV Rental Deposit", amount: 500, paidBy: "Markus", splitBetween: friends, date: "2026-07-01" },
    { id: 2, description: "Ferry Tickets", amount: 280, paidBy: "Tom", splitBetween: friends, date: "2026-07-05" }
  ]);
  const [newExpense, setNewExpense] = useState({
    description: '', amount: '', paidBy: '', splitBetween: [...friends], date: new Date().toISOString().split('T')[0]
  });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "What's our priority for the Okanagan Valley?",
      options: ["Wine tasting marathon", "Lake activities & swimming", "Mix of both wine and water"],
      votes: {}, active: true
    }
  ]);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', '', ''] });
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [showWeatherDetails, setShowWeatherDetails] = useState({});
  const [showDaySummary, setShowDaySummary] = useState({});
  const [editableItinerary, setEditableItinerary] = useState(
    defaultItinerary.map(day => ({
      ...day,
      costs: { activities: 0, accommodations: 0 },
      assignments: {}
    }))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [photoChallenges, setPhotoChallenges] = useState([
    { id: 1, description: "Epic sunset in Tofino", assignedTo: [], completedBy: [], thumbnail: '', timestamp: null },
    { id: 2, description: "Group selfie at Kelowna winery", assignedTo: [], completedBy: [], thumbnail: '', timestamp: null }
  ]);
  const [newChallenge, setNewChallenge] = useState({ description: '', assignedTo: [] });
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [photoBoard, setPhotoBoard] = useState({ messages: [] });
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Constants (friends and loginCodes unchanged)
  const friends = ["Markus", "Tom", "Ramon", "Churchill", "Emil", "Henning", "Paddy", "Radu", "Tudor", "P-J"];
  const loginCodes = {
    EPIC40: "Markus",
    COOLCAT: "Tom",
    RADRAMON: "Ramon",
    CHURCHILL: "Churchill",
    EMILROCKS: "Emil",
    HENN40: "Henning",
    PADDYBOY: "Paddy",
    RADU40: "Radu",
    TUDOR: "Tudor",
    PJPARTY: "P-J"
  };
  const locations = [
    { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
    { name: "Osoyoos", lat: 49.0325, lng: -119.4525 },
    { name: "Kelowna", lat: 49.8880, lng: -119.4960 },
    { name: "Pemberton", lat: 50.3192, lng: -122.7948 },
    { name: "Tofino", lat: 49.1533, lng: -125.9060 },
    { name: "Victoria", lat: 48.4284, lng: -123.3656 },
    { name: "Cultus Lake", lat: 49.0561, lng: -121.9643 }
  ];
  const defaultItinerary = [
    {
      day: 1,
      location: "Vancouver to Osoyoos",
      highlight: "Desert Adventure",
      distance: "380 km (4.5 hours)",
      overnight: "Haynes Point Provincial Park",
      summary: "Depart Vancouver, explore Osoyoos desert and lake.",
      activities: [
        "Morning: Depart Vancouver (8:00 AM), stop in Chilliwack for supplies, drive via Highway 5 to 3A",
        "Afternoon: Arrive Osoyoos (~1:00 PM), set up at Haynes Point, visit Osoyoos Desert Centre, wine tasting",
        "Evening: Sunset at Osoyoos Lake Beach, dinner at local restaurant"
      ],
      rvNotes: "Haynes Point has 41 sites, very popular in summer. Book well in advance."
    },
    {
      day: 2,
      location: "Osoyoos to Kelowna",
      highlight: "Okanagan Lake",
      distance: "100 km (1.5 hours)",
      overnight: "Fintry Provincial Park",
      summary: "Drive to Kelowna, enjoy lakeside camping and history.",
      activities: [
        "Morning: Visit Nk'Mip Desert Cultural Centre, depart Osoyoos (~11:00 AM), drive Highway 97",
        "Afternoon: Arrive Kelowna (~12:30 PM), set up at Fintry, explore Fintry estate, swim in lake",
        "Evening: Campfire by the lake, grocery shopping in Kelowna"
      ],
      rvNotes: "Fintry has basic sites, some with electrical hookups. Stunning lake views."
    },
    {
      day: 3,
      location: "Kelowna",
      highlight: "Rest Day",
      distance: "0 km",
      overnight: "Fintry Provincial Park",
      summary: "Relax and explore Kelowna’s wineries, lake, and culture.",
      activities: [
        "Full Day: Wine tours (arrange designated driver), Big White Scenic Chairlift, Kelowna Farmers Market (Saturday), kayaking/paddleboarding, Downtown Kelowna Cultural District",
        "Maintenance: Laundry, supplies, RV servicing if needed"
      ],
      rvNotes: "Fintry has basic sites, some with electrical hookups. Stunning lake views."
    },
    {
      day: 4,
      location: "Kelowna to Pemberton",
      highlight: "Mountain Journey",
      distance: "350 km (4.5 hours)",
      overnight: "Nairn Falls Provincial Park",
      summary: "Drive to Pemberton, hike and enjoy mountain views.",
      activities: [
        "Morning: Depart Kelowna (8:00 AM), drive via Highway 97C to Merritt, then Highway 5 to 99",
        "Afternoon: Arrive Pemberton (~1:00 PM), set up at Nairn Falls, hike to Nairn Falls (1.5 km)",
        "Evening: Explore Pemberton village, mountain photography"
      ],
      rvNotes: "Nairn Falls has 94 sites with basic facilities. Mountain setting."
    },
    {
      day: 5,
      location: "Pemberton to Tofino",
      highlight: "Pacific Coast",
      distance: "420 km (6 hours) + 1.5 hour ferry",
      overnight: "Pacific Rim National Park or Bella Pacifica",
      summary: "Drive and ferry to Tofino, explore Pacific beaches.",
      activities: [
        "Morning: Depart Pemberton (7:00 AM), drive Sea-to-Sky Highway to Horseshoe Bay, ferry to Nanaimo",
        "Afternoon: Drive Highway 4 through Cathedral Grove, arrive Tofino (~4:00 PM), set up camp",
        "Evening: Visit Pacific Ocean beaches, sunset at Chesterman Beach, Tofino village dinner"
      ],
      rvNotes: "Make ferry reservations in advance. Limited RV camping in Tofino. Reservations essential."
    },
    {
      day: 6,
      location: "Tofino",
      highlight: "Ocean Activities",
      distance: "0 km",
      overnight: "Pacific Rim National Park or Bella Pacifica",
      summary: "Enjoy Tofino’s beaches, surfing, and wildlife.",
      activities: [
        "Full Day: Surfing lessons (Long Beach/Chesterman), Hot Springs Cove boat tour, whale watching, Rainforest Trail, Pacific Rim National Park trails",
        "Evening: Storm watching (if weather permits), local seafood dinner"
      ],
      rvNotes: "Limited RV camping in Tofino. Reservations essential."
    },
    {
      day: 7,
      location: "Tofino to Victoria",
      highlight: "Island Drive",
      distance: "320 km (4.5 hours)",
      overnight: "Goldstream Provincial Park",
      summary: "Drive to Victoria, explore falls and Inner Harbour.",
      activities: [
        "Morning: Final Tofino beach walk, depart (~9:00 AM), drive Highway 4 to 1",
        "Afternoon: Arrive Victoria (~2:00 PM), set up at Goldstream, explore Goldstream Falls",
        "Evening: Visit Victoria Inner Harbour, dinner and stroll"
      ],
      rvNotes: "Goldstream has 173 sites in old-growth forest."
    },
    {
      day: 8,
      location: "Victoria",
      highlight: "City Exploration",
      distance: "0 km",
      overnight: "Goldstream Provincial Park",
      summary: "Explore Victoria’s gardens, museum, and harbour.",
      activities: [
        "Full Day: Butchart Gardens, Royal BC Museum, Inner Harbour (Parliament, Empress), Beacon Hill Park, whale watching",
        "Evening: Victoria dining, sunset at Dallas Road waterfront"
      ],
      rvNotes: "Goldstream has 173 sites in old-growth forest."
    },
    {
      day: 9,
      location: "Victoria to Cultus Lake/Vancouver",
      highlight: "Final Night",
      distance: "150 km (2.5 hours) + 1.5 hour ferry",
      overnight: "Cultus Lake Provincial Park or Vancouver",
      summary: "Ferry to mainland, camp or return to Vancouver.",
      activities: [
        "Morning: Final Victoria exploration, ferry from Swartz Bay to Tsawwassen",
        "Afternoon: Arrive mainland (~2:00 PM), option to camp at Cultus Lake or return to Vancouver",
        "Evening: Reflection on trip, final campfire (if at Cultus Lake)"
      ],
      rvNotes: "Cultus Lake has 281 sites if camping. Check RV size limits."
    },
    {
      day: 10,
      location: "Cultus Lake to Vancouver",
      highlight: "Trip Conclusion",
      distance: "120 km (1.5 hours)",
      overnight: "None (return RV)",
      summary: "Return to Vancouver, conclude trip.",
      activities: [
        "Morning: Break camp (if at Cultus Lake), final supply stop, return to Vancouver (~11:00 AM)",
        "Afternoon: RV return and cleanup, trip conclusion"
      ],
      rvNotes: "Check RV return requirements."
    }
  ];

  // ... (all other constants, functions, and useEffect hooks remain unchanged from previous version)

  // Render method (only itinerary section updated)
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white min-h-screen">
      {!currentUser ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Login to BC Bros Road Trip</h2>
            <input
              type="text"
              placeholder="Enter your login code"
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
            />
            {loginError && <p className="text-red-500 text-sm mb-3">{loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ... (header and navigation tabs unchanged) */}

          {currentSection === 'itinerary' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">📅 Itinerary</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    {isEditing ? 'Cancel Editing' : 'Edit Itinerary'}
                  </button>
                  {isEditing && (
                    <>
                      <button
                        onClick={saveItinerary}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={resetItinerary}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editableItinerary.map(day => (
                <div key={day.day} className="bg-white border border-gray-200 rounded-lg p-4">
                  <button
                    onClick={() => setShowDaySummary(prev => ({
                      ...prev,
                      [day.day]: !prev[day.day]
                    }))}
                    className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded"
                    aria-expanded={!!showDaySummary[day.day]}
                  >
                    <div>
                      <h3 className="font-bold text-gray-800">Day {day.day}: {day.location}</h3>
                      <p className="text-sm text-gray-600">{day.highlight} {day.distance ? `• ${day.distance}` : ''}</p>
                    </div>
                    <span>{showDaySummary[day.day] ? '▲' : '▼'}</span>
                  </button>
                  {showDaySummary[day.day] && (
                    <div className="mt-4 space-y-4">
                      <div>
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={day.summary}
                              onChange={(e) =>
                                setEditableItinerary(prev =>
                                  prev.map(d =>
                                    d.day === day.day ? { ...d, summary: e.target.value } : d
                                  )
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                            />
                            <textarea
                              value={day.activities.join('\n')}
                              onChange={(e) =>
                                setEditableItinerary(prev =>
                                  prev.map(d =>
                                    d.day === day.day
                                      ? { ...d, activities: e.target.value.split('\n').filter(a => a.trim()) }
                                      : d
                                  )
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                              rows={4}
                              placeholder="One activity per line"
                            />
                            <input
                              type="text"
                              value={day.distance}
                              onChange={(e) =>
                                setEditableItinerary(prev =>
                                  prev.map(d =>
                                    d.day === day.day ? { ...d, distance: e.target.value } : d
                                  )
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded mt-2"
                              placeholder="Distance (e.g., 380 km)"
                            />
                            <input
                              type="text"
                              value={day.overnight}
                              onChange={(e) =>
                                setEditableItinerary(prev =>
                                  prev.map(d =>
                                    d.day === day.day ? { ...d, overnight: e.target.value } : d
                                  )
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded mt-2"
                              placeholder="Overnight location"
                            />
                            <textarea
                              value={day.rvNotes}
                              onChange={(e) =>
                                setEditableItinerary(prev =>
                                  prev.map(d =>
                                    d.day === day.day ? { ...d, rvNotes: e.target.value } : d
                                  )
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded mt-2"
                              rows={2}
                              placeholder="RV notes"
                            />
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600"><strong>Summary:</strong> {day.summary}</p>
                            <p className="text-sm text-gray-600"><strong>Overnight:</strong> {day.overnight}</p>
                            {day.distance && <p className="text-sm text-gray-600"><strong>Distance:</strong> {day.distance}</p>}
                            <p className="text-sm text-gray-600"><strong>Activities:</strong></p>
                            <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
                              {day.activities.map((activity, idx) => (
                                <li key={idx}>{activity}</li>
                              ))}
                            </ul>
                            <p className="text-sm text-gray-600 mt-2"><strong>RV Notes:</strong> {day.rvNotes}</p>
                          </>
                        )}
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-2">Estimated Costs</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm text-gray-600">Activities ($)</label>
                            <input
                              type="number"
                              value={day.costs.activities}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setEditableItinerary(prev =>
                                  prev.map(d =>
                                    d.day === day.day
                                      ? { ...d, costs: { ...d.costs, activities: value } }
                                      : d
                                  )
                                );
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                              placeholder="e.g., 100"
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Accommodations ($)</label>
                            <input
                              type="number"
                              value={day.costs.accommodations}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setEditableItinerary(prev =>
                                  prev.map(d =>
                                    d.day === day.day
                                      ? { ...d, costs: { ...d.costs, accommodations: value } }
                                      : d
                                  )
                                );
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                              placeholder="e.g., 200"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Total Estimated: ${(day.costs.activities + day.costs.accommodations).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Actual Expenses: ${(calculateActualExpensesPerDay()[day.day] || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ... (all other sections: overview, chat, photos, map unchanged) */}
        </>
      )}
    </div>
  );
};

export default BCRoadTripPlanner;
```
