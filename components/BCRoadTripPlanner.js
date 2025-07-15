
'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Coffee, Mountain, Calendar, Users, Zap, Star, Map } from 'lucide-react';

const BCRoadTripPlanner = () => {
  const defaultItinerary = [
    { day: 1, location: "Vancouver → Osoyoos", highlight: "Desert wine country adventure", activities: ["Early departure from Vancouver", "Chilliwack supply stop", "Osoyoos Desert Centre", "Wine tasting"] },
    { day: 2, location: "Osoyoos → Kelowna", highlight: "Okanagan Lake paradise", activities: ["Nk'Mip Desert Cultural Centre", "Drive along Okanagan Lake", "Fintry Provincial Park setup", "Lakeside swimming"] },
    { day: 3, location: "Kelowna Rest Day", highlight: "Wine tours and lake activities", activities: ["Local winery visits", "Big White Scenic Chairlift", "Okanagan Lake water sports", "Downtown Kelowna"] },
    { day: 4, location: "Kelowna → Pemberton", highlight: "Mountain valley transition", activities: ["Coquihalla Highway drive", "Nairn Falls Provincial Park", "Nairn Falls hike", "Mountain photography"] },
    { day: 5, location: "Pemberton → Tofino", highlight: "Sea-to-Sky to Pacific Ocean", activities: ["Sea-to-Sky Highway", "Horseshoe Bay ferry", "Cathedral Grove", "First Pacific sunset"] },
    { day: 6, location: "Tofino Adventures", highlight: "Surf, whales, and hot springs", activities: ["Surfing lessons", "Hot Springs Cove boat tour", "Whale watching", "Rainforest boardwalk trails"] },
    { day: 7, location: "Tofino → Victoria", highlight: "West coast to capital city", activities: ["Final Tofino beach walk", "Drive through Island interior", "Goldstream Provincial Park", "Victoria Inner Harbour"] },
    { day: 8, location: "Victoria Exploration", highlight: "Gardens and royal treatment", activities: ["Butchart Gardens", "Royal BC Museum", "Inner Harbour stroll", "Beacon Hill Park peacocks"] },
    { day: 9, location: "Victoria → Vancouver", highlight: "Ferry crossing finale", activities: ["Swartz Bay to Tsawwassen ferry", "Optional Cultus Lake stop", "Trip reflection", "Final group dinner"] },
    { day: 10, location: "Vancouver Return", highlight: "Epic journey complete", activities: ["RV return and cleanup", "Final supply run", "Airport departures", "Legendary memories made"] }
  ];

  const friends = ["Markus", "Tom", "Ramon", "Churchill", "Emil", "Henning", "Paddy", "Radu", "Tudor", "P-J"];
  const locations = [
    { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
    { name: "Osoyoos", lat: 49.0325, lng: -119.4525 },
    { name: "Kelowna", lat: 49.8880, lng: -119.4960 },
    { name: "Pemberton", lat: 50.3192, lng: -122.7948 },
    { name: "Tofino", lat: 49.1533, lng: -125.9060 },
    { name: "Victoria", lat: 48.4284, lng: -123.3656 }
  ];

  const [currentSection, setCurrentSection] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableItinerary, setEditableItinerary] = useState(
    defaultItinerary.map(day => ({ ...day, costs: { activities: 0, accommodations: 0 }, assignments: {}, votes: {} }))
  );
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentFunFact, setCurrentFunFact] = useState(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpMessageId, setFollowUpMessageId] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [weatherData, setWeatherData] = useState({});
  const [contributions, setContributions] = useState({ tempFriend: '', tempAmount: 0, tempDescription: '' });

  // Dropdown states for new collapsibles
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [showContributions, setShowContributions] = useState(false);
  const [openWeather, setOpenWeather] = useState({});

  const bcFunFacts = [
    {
      title: "Raincouver Is Real",
      fact: "Vancouver gets so much rain that locals joke about owning multiple rain jackets, each for a different level of wetness — from 'misty drizzle' to 'horizontal sideways rain.'",
      tip: "☔ Locals don't even use umbrellas. That's how you spot a tourist."
    },
    // Add more fun facts if you want!
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedItinerary = localStorage.getItem('bcRoadTripItinerary');
      const cachedConversation = localStorage.getItem('bcRoadTripConversation');
      const cachedWeather = localStorage.getItem('bcRoadTripWeather');
      const cachedContributions = localStorage.getItem('bcRoadTripContributions');
      if (cachedItinerary) setEditableItinerary(JSON.parse(cachedItinerary));
      if (cachedConversation) setConversation(JSON.parse(cachedConversation).slice(-50));
      if (cachedWeather) setWeatherData(JSON.parse(cachedWeather));
      if (cachedContributions) setContributions(prev => ({ ...prev, ...JSON.parse(cachedContributions) }));

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcRoadTripItinerary', JSON.stringify(editableItinerary));
      localStorage.setItem('bcRoadTripConversation', JSON.stringify(conversation.slice(-50)));
      localStorage.setItem('bcRoadTripContributions', JSON.stringify({
        ...contributions,
        tempFriend: undefined,
        tempAmount: undefined,
        tempDescription: undefined
      }));
      localStorage.setItem('bcRoadTripWeather', JSON.stringify(weatherData));
    }
  }, [editableItinerary, conversation, contributions, weatherData]);

  const fetchWeather = async () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || 'b4852d0dab1e53207f5a738c8564f18b';
    const now = Date.now();
    const cacheDuration = 6 * 60 * 60 * 1000;
    const cachedWeather = JSON.parse(localStorage.getItem('bcRoadTripWeather') || '{}');
    for (const loc of locations) {
      if (cachedWeather[loc.name] && now - cachedWeather[loc.name].timestamp < cacheDuration) {
        continue;
      }
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${loc.lat}&lon=${loc.lng}&units=metric&appid=${apiKey}`
        );
        if (!res.ok) throw new Error(`Weather API error for ${loc.name}: ${res.status}`);
        const data = await res.json();
        setWeatherData(prev => ({
          ...prev,
          [loc.name]: {
            current: {
              temp: Math.round(data.list[0].main.temp),
              condition: data.list[0].weather[0].main,
              icon: data.list[0].weather[0].icon
            },
            forecast: data.list.slice(0, 5).map(item => ({
              date: new Date(item.dt * 1000).toLocaleDateString(),
              temp: Math.round(item.main.temp),
              condition: item.weather[0].main
            })),
            timestamp: now
          }
        }));
      } catch (error) {
        console.error(`Failed to fetch weather for ${loc.name}:`, error);
        setWeatherData(prev => ({
          ...prev,
          [loc.name]: {
            current: { temp: 'N/A', condition: 'Unavailable', icon: '' },
            forecast: [],
            timestamp: now
          }
        }));
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcRoadTripWeather', JSON.stringify(weatherData));
    }
  };

  useEffect(() => {
    if (isOnline) fetchWeather();
  }, [isOnline]);

  const getRandomFunFact = () => {
    const randomIndex = Math.floor(Math.random() * bcFunFacts.length);
    setCurrentFunFact(bcFunFacts[randomIndex]);
  };

  // Helper functions for votes, assignments, etc. (as in your original)
  const handleVote = (dayIndex, activityIndex, friend, vote) => {
    const updated = [...editableItinerary];
    if (!updated[dayIndex].votes[activityIndex]) updated[dayIndex].votes[activityIndex] = {};
    updated[dayIndex].votes[activityIndex][friend] = vote;
    setEditableItinerary(updated);
  };

  const handleAssign = (dayIndex, activityIndex, friend) => {
    const updated = [...editableItinerary];
    updated[dayIndex].assignments[activityIndex] = friend;
    setEditableItinerary(updated);
  };

  const handleContribution = (friend, amount, description) => {
    setContributions(prev => ({
      ...prev,
      [friend]: [...(prev[friend] || []), { amount, description, timestamp: Date.now() }],
      tempFriend: '',
      tempAmount: 0,
      tempDescription: ''
    }));
  };

  const updateDayCosts = (dayIndex, field, value) => {
    const updated = [...editableItinerary];
    updated[dayIndex].costs[field] = parseFloat(value) || 0;
    setEditableItinerary(updated);
  };

  // Quick questions for the chat
  const quickQuestions = [
    "What are the most epic activities for our diverse route from desert to ocean?",
    "Hidden gems between Osoyoos wine country and Tofino beaches?",
    "Best RV camping spots and ferry booking tips for our route?",
    "What should we pack for desert, lakes, mountains AND ocean? (Philosophical debates included)",
    "Local wine, craft breweries, and food along our new route? (Henning's dive bar radar activated)",
    "Emergency backup plans if BC ferries are delayed? (Radu will probably suggest crypto trading while waiting)"
  ];

  // ----- RENDER OVERVIEW (new) -----
  const totalBudget = editableItinerary.reduce((sum, day) => sum + day.costs.activities + day.costs.accommodations, 0);
  const totalContributions = Object.values(contributions)
    .filter(f => f && Array.isArray(f))
    .flat()
    .reduce((sum, c) => sum + c.amount, 0) || 0;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* ... See next message for full renderOverview (it fits better there for readability) ... */}
    {/* --- OVERVIEW PAGE CONTENT CONTINUED --- */}

      {/* BUDGET PLANNER (see part 1 for collapsible logic) */}
      {/* ...previous budget planner code ... */}

      {/* WEATHER FORECAST (see part 1 for collapsible logic) */}
      {/* ...previous weather forecast code ... */}

      {/* GROUP COORDINATION */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
        <h3 className="font-bold text-purple-800 mb-2">🤝 Group Coordination</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">Activity Assignments & Votes:</h4>
            {editableItinerary.map((day, dayIndex) => (
              <div key={day.day} className="mb-2">
                <button
                  onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
                  className="w-full text-left p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 focus:outline-none"
                  aria-expanded={selectedDay === day.day}
                  aria-label={`Toggle activities for Day ${day.day} (${day.location})`}
                >
                  <span className="text-sm font-medium">Day {day.day} ({day.location})</span>
                  <span className="ml-2">{selectedDay === day.day ? '▲' : '▼'}</span>
                </button>
                {selectedDay === day.day && (
                  <div className="mt-2 pl-4 space-y-2">
                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex items-center gap-2">
                        <span>{activity}</span>
                        <select
                          value={day.assignments[activityIndex] || ''}
                          onChange={(e) => handleAssign(dayIndex, activityIndex, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                          aria-label={`Assign ${activity} for Day ${day.day}`}
                        >
                          <option value="">Assign...</option>
                          {friends.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <div className="flex gap-1">
                          {friends.map(friend => (
                            <button
                              key={friend}
                              onClick={() => handleVote(dayIndex, activityIndex, friend, day.votes[activityIndex]?.[friend] === 'up' ? null : 'up')}
                              className={`text-xs ${day.votes[activityIndex]?.[friend] === 'up' ? 'text-green-600' : 'text-gray-400'} hover:text-green-700 focus:outline-none`}
                              aria-label={`Vote ${day.votes[activityIndex]?.[friend] === 'up' ? 'remove' : 'add'} for ${activity} by ${friend}`}
                            >
                              👍
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FUN FACTS */}
      <div className="flex justify-center">
        <button
          onClick={getRandomFunFact}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"
          aria-label="Get a random BC fun fact"
        >
          <span className="text-xl">🤯</span>
          <span className="font-semibold">BC Fun Facts</span>
          <span className="text-sm opacity-90">(Prepare to be amused)</span>
        </button>
      </div>
      {currentFunFact && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-purple-800">{currentFunFact.title}</h3>
            <button
              onClick={() => setCurrentFunFact(null)}
              className="text-purple-600 hover:text-purple-800 text-xl"
              aria-label="Close fun fact"
            >
              ✕
            </button>
          </div>
          <p className="text-purple-700 mb-3 leading-relaxed">{currentFunFact.fact}</p>
          <div className="bg-purple-100 rounded-lg p-3 border-l-4 border-purple-400">
            <p className="text-purple-800 font-medium">{currentFunFact.tip}</p>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={getRandomFunFact}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
              aria-label="Get another random BC fun fact"
            >
              🎲 Another Fun Fact!
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ----- RENDER ITINERARY -----
  const renderItinerary = () => {
    const currentItinerary = isEditing ? editableItinerary : defaultItinerary;
    const updateDay = (dayIndex, field, value) => {
      if (!value.trim()) return;
      const updated = [...editableItinerary];
      if (field === 'activities') {
        updated[dayIndex].activities = value.split(',').map(a => a.trim()).filter(a => a);
      } else {
        updated[dayIndex][field] = value.trim();
      }
      setEditableItinerary(updated);
    };
    const addActivity = (dayIndex) => {
      const updated = [...editableItinerary];
      updated[dayIndex].activities.push('New activity');
      setEditableItinerary(updated);
    };
    const removeActivity = (dayIndex, activityIndex) => {
      const updated = [...editableItinerary];
      updated[dayIndex].activities.splice(activityIndex, 1);
      setEditableItinerary(updated);
    };
    const resetItinerary = () => {
      setEditableItinerary(defaultItinerary.map(day => ({ ...day, costs: { activities: 0, accommodations: 0 }, assignments: {}, votes: {} })));
      setIsEditing(false);
    };
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">🗺️ Your 10-Day Adventure Map</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              aria-label={showMap ? "Hide route map" : "Show route map"}
            >
              <Map className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Show Route Map'}
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  aria-label="Save itinerary changes"
                >
                  Save Changes
                </button>
                <button
                  onClick={resetItinerary}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  aria-label="Reset itinerary"
                >
                  Reset
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditableItinerary(defaultItinerary.map(day => ({ ...day, costs: { activities: 0, accommodations: 0 }, assignments: {}, votes: {} })));
                  setIsEditing(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                aria-label="Edit itinerary"
              >
                Edit Itinerary
              </button>
            )}
          </div>
        </div>
        {/* ...Map rendering and itinerary days remain unchanged... */}
        {/* (Paste your previous itinerary day rendering code here) */}
      </div>
    );
  };

  // ----- RENDER CHAT -----
  const renderChat = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <img
            src="https://i.imgur.com/xtAl4ow.png"
            alt="Nanook - Your BC Guide"
            className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
          />
          <div>
            <h2 className="text-xl font-bold mb-1">🤙 Chat with Nanook!</h2>
            <p className="text-lg mb-1">Your cheeky BC guide with insider knowledge!</p>
            <p className="text-sm opacity-90">Former number-cruncher turned wilderness enthusiast. Ready to help you legends plan the most epic BC adventure ever!</p>
          </div>
        </div>
      </div>
      {/* ...rest of your chat UI code here, unchanged... */}
    </div>
  );

  // ----- MAIN RETURN -----
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🚐 BC Bros Road Trip Planner
        </h1>
        <p className="text-gray-600">July 2026 • 10 Days • Markus's 40th Birthday • International Legends</p>
      </div>
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setCurrentSection('overview')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            currentSection === 'overview'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          aria-label="View trip overview"
        >
          <Star className="w-4 h-4 inline mr-1" />
          Overview
        </button>
        <button
          onClick={() => setCurrentSection('itinerary')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            currentSection === 'itinerary'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          aria-label="View itinerary"
        >
          <Calendar className="w-4 h-4 inline mr-1" />
          Itinerary
        </button>
        <button
          onClick={() => setCurrentSection('chat')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            currentSection === 'chat'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          aria-label="Chat with Nanook"
        >
          <Coffee className="w-4 h-4 inline mr-1" />
          Chat with Nanook
        </button>
      </div>
      {currentSection === 'overview' && renderOverview()}
      {currentSection === 'itinerary' && renderItinerary()}
      {currentSection === 'chat' && renderChat()}
    </div>
  );
};

export default BCRoadTripPlanner;
