
'use client'

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

  // ... [MAP and AI code remains unchanged] ...

  // Omitted: handleClaude, handleReaction, handleVote, handleAssign, handleContribution, updateDayCosts, quickQuestions, renderItinerary, renderChat
  // They remain as in your existing code; only renderOverview is changed.

  const totalBudget = editableItinerary.reduce((sum, day) => sum + day.costs.activities + day.costs.accommodations, 0);
  const totalContributions = Object.values(contributions)
    .filter(f => f && Array.isArray(f))
    .flat()
    .reduce((sum, c) => sum + c.amount, 0) || 0;

  // ---- NEW RENDER OVERVIEW ----
  const renderOverview = () => (
    <div className="space-y-6">
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 text-yellow-800">
          <p>📡 Offline Mode: Using cached data. Some features may be limited until you're back online!</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🏔️ The Ultimate BC Bro-Trip</h2>
        <p className="text-lg">Markus's epic 40th birthday adventure! Desert wine country → Okanagan lakes → Pacific Ocean → Island paradise. 10 international legends, 10 unforgettable days!</p>
      </div>

      <div className="flex justify-center">
        <img
          src="https://i.imgur.com/nG9m1vO.png"
          alt="Markus's 40th Birthday BC Adventure"
          className="rounded-xl shadow-lg max-w-full h-auto"
          style={{ maxHeight: '400px' }}
        />
      </div>

      {/* BUDGET PLANNER */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">💰 Budget Planner</h3>
        <div className="space-y-4 text-sm">
          <p><strong>Total Estimated Cost:</strong> ${totalBudget.toFixed(2)}</p>
          <p><strong>Total Contributions:</strong> ${totalContributions.toFixed(2)}</p>

          {/* Breakdown by Day */}
          <button onClick={() => setShowBreakdown(v => !v)} className="w-full text-left py-2 font-semibold text-yellow-700 flex justify-between">
            Breakdown by Day {showBreakdown ? '▲' : '▼'}
          </button>
          {showBreakdown && (
            <ul className="list-disc pl-5">
              {editableItinerary.map(day => (
                <li key={day.day}>
                  Day {day.day} ({day.location}): Activities ${day.costs.activities.toFixed(2)}, Accommodations ${day.costs.accommodations.toFixed(2)}
                </li>
              ))}
            </ul>
          )}

          {/* Enter Estimated Costs */}
          <button onClick={() => setShowCosts(v => !v)} className="w-full text-left py-2 font-semibold text-yellow-700 flex justify-between">
            Enter Estimated Costs {showCosts ? '▲' : '▼'}
          </button>
          {showCosts && (
            <div className="space-y-2">
              {editableItinerary.map((day, dayIndex) => (
                <div key={day.day} className="flex items-center gap-2">
                  <span>Day {day.day} ({day.location}):</span>
                  <input
                    type="number"
                    value={day.costs.activities}
                    onChange={(e) => updateDayCosts(dayIndex, 'activities', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded w-24"
                    placeholder="Activities"
                  />
                  <input
                    type="number"
                    value={day.costs.accommodations}
                    onChange={(e) => updateDayCosts(dayIndex, 'accommodations', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded w-24"
                    placeholder="Accommodations"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Contributions */}
          <button onClick={() => setShowContributions(v => !v)} className="w-full text-left py-2 font-semibold text-yellow-700 flex justify-between">
            Contributions {showContributions ? '▲' : '▼'}
          </button>
          {showContributions && (
            <div>
              <div className="grid md:grid-cols-2 gap-2">
                {friends.map(friend => (
                  <div key={friend}>
                    <strong>{friend}:</strong> ${contributions[friend]?.reduce((sum, c) => sum + c.amount, 0) || 0} ({contributions[friend]?.length || 0} contributions)
                    {contributions[friend]?.map((c, idx) => (
                      <p key={idx} className="text-xs text-gray-600">• ${c.amount} for {c.description}</p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-yellow-700">Add Contribution:</h5>
                <div className="flex gap-2 mt-2">
                  <select
                    value={contributions.tempFriend || ''}
                    onChange={(e) => setContributions(prev => ({ ...prev, tempFriend: e.target.value }))}
                    className="px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="">Select Friend</option>
                    {friends.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    className="px-2 py-1 border border-gray-300 rounded w-24"
                    onChange={(e) => setContributions(prev => ({ ...prev, tempAmount: parseFloat(e.target.value) || 0 }))}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="px-2 py-1 border border-gray-300 rounded flex-1"
                    onChange={(e) => setContributions(prev => ({ ...prev, tempDescription: e.target.value }))}
                  />
                  <button
                    onClick={() => {
                      const { tempFriend, tempAmount, tempDescription } = contributions;
                      if (tempFriend && tempAmount && tempDescription) {
                        handleContribution(tempFriend, tempAmount, tempDescription);
                      }
                    }}
                    className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WEATHER FORECAST */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">🌤️ Weather Forecast</h3>
        <div className="space-y-2 text-sm">
          {locations.map(loc => (
            <div key={loc.name} className="mb-1">
              <button
                className="w-full text-left font-semibold text-blue-700 flex justify-between py-1"
                onClick={() => setOpenWeather(prev => ({ ...prev, [loc.name]: !prev[loc.name] }))}
                aria-expanded={!!openWeather[loc.name]}
              >
                {loc.name} {openWeather[loc.name] ? '▲' : '▼'}
              </button>
              {openWeather[loc.name] && (
                weatherData[loc.name]?.current ? (
                  <div className="pl-4">
                    <p>Current: {weatherData[loc.name].current.temp}°C, {weatherData[loc.name].current.condition}
                      {weatherData[loc.name].current.icon && (
                        <img
                          src={`http://openweathermap.org/img/wn/${weatherData[loc.name].current.icon}.png`}
                          alt={weatherData[loc.name].current.condition}
                          className="inline w-6 h-6 ml-1"
                        />
                      )}
                    </p>
                    <p>5-Day Forecast:</p>
                    <ul className="text-xs list-disc pl-5">
                      {weatherData[loc.name].forecast?.map((f
