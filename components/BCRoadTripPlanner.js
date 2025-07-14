
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

  // BC Fun Facts (shortened for brevity)
  const bcFunFacts = [
    {
      title: "Raincouver Is Real",
      fact: "Vancouver gets so much rain that locals joke about owning multiple rain jackets, each for a different level of wetness — from 'misty drizzle' to 'horizontal sideways rain.'",
      tip: "☔ Locals don't even use umbrellas. That's how you spot a tourist."
    },
  ];

  // Offline Functionality
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
      window.removeEventListener('offline', handleOffline);
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

  // Weather Integration
  const fetchWeather = async () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || 'b4852d0dab1e53207f5a738c8564f18b';
    const now = Date.now();
    const cacheDuration = 6 * 60 * 60 * 1000; // 6 hours
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

  const showMapError = () => {
    const mapElement = document.getElementById('trip-map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600" role="alert" aria-live="polite">
          <div className="text-center p-8">
            <p className="text-lg font-semibold mb-2">🗺️ Map temporarily unavailable</p>
            <p className="text-sm mb-4">Your epic BC route:</p>
            <div className="text-left bg-white rounded-lg p-4 shadow-sm max-w-sm mx-auto">
              <div className="text-xs space-y-1">
                <div>📍 Vancouver → Osoyoos (Desert)</div>
                <div>📍 Osoyoos → Kelowna (Wine Country)</div>
                <div>📍 Kelowna → Pemberton (Mountains)</div>
                <div>📍 Pemberton → Tofino (Ocean)</div>
                <div>📍 Tofino → Victoria (Islands)</div>
                <div>📍 Victoria → Vancouver (Home)</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  };

  const createMap = () => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps || !document.getElementById('trip-map')) {
      console.log('Google Maps not ready');
      showMapError();
      return;
    }

    try {
      const map = new window.google.maps.Map(document.getElementById('trip-map'), {
        zoom: 6,
        center: { lat: 49.5, lng: -122.0 },
        mapTypeId: 'terrain'
      });

      const mapLocations = [
        { lat: 49.2827, lng: -123.1207, name: "Vancouver Start", day: 1 },
        { lat: 49.0325, lng: -119.4525, name: "Osoyoos", day: 2 },
        { lat: 49.8880, lng: -119.4960, name: "Kelowna", day: 3 },
        { lat: 50.3192, lng: -122.7948, name: "Pemberton", day: 4 },
        { lat: 49.1533, lng: -125.9060, name: "Tofino", day: 5 },
        { lat: 49.1400, lng: -125.8900, name: "Tofino Day 2", day: 6 },
        { lat: 48.4284, lng: -123.3656, name: "Victoria", day: 7 },
        { lat: 48.4200, lng: -123.3500, name: "Victoria Day 2", day: 8 },
        { lat: 49.1666, lng: -121.9833, name: "Cultus Lake", day: 9 },
        { lat: 49.2900, lng: -123.1100, name: "Vancouver Return", day: 10 }
      ];

      mapLocations.forEach(location => {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: `Day ${location.day}: ${location.name}`,
          label: {
            text: location.day.toString(),
            color: 'white',
            fontWeight: 'bold'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 8px;"><h3 style="margin: 0; color: #1f2937;">Day ${location.day}</h3><p style="margin: 5px 0 0 0; color: #3B82F6;">${location.name}</p></div>`
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    } catch (error) {
      console.error('Error creating map:', error);
      showMapError();
    }
  };

  useEffect(() => {
    if (showMap && !mapLoaded) {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setMapLoaded(true);
        createMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDqBGR6jfw1eatF7DYtpLdnhc-uQBdL40I`;
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
        setTimeout(createMap, 100);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps');
        showMapError();
      };

      document.head.appendChild(script);
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [showMap, mapLoaded]);

  const handleClaude = async (prompt, parentMessageId = null) => {
    if (!isOnline) {
      setConversation(prev => [...prev, {
        id: Date.now(),
        type: 'nanook',
        content: "Whoa, legends! Looks like we're offline. Check back when you've got signal, and I'll hook you up with epic BC advice!",
        recommendations: [],
        insider_tip: "",
        timestamp: Date.now(),
        reactions: [],
        parentId: parentMessageId
      }]);
      return;
    }

    setIsLoading(true);
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: Date.now(),
      reactions: [],
      parentId: parentMessageId
    };
    setConversation(prev => [...prev, newMessage]);

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `You are Nanook, a cheeky and enthusiastic BC tour guide helping plan an epic road trip. You're a former accountant turned wilderness guide with a great sense of humor and genuine love for BC's wild beauty. 

You're helping Markus's legendary 40th birthday crew (THE INTERNATIONAL LEGENDS: Markus Canadian/German birthday boy, Tom French/Irish party animal, Ramon Dutch/Peruvian UFC fan, Churchill Dubai expat, Emil Swedish leftie, Henning German/Dutch sailing enthusiast, Paddy Irish Peter Pan, Radu youngest crypto enthusiast, Tudor Romanian/Dutch liberal, P-J oldest Belgian government worker) plan their epic BC road trip in July 2026.

Be fun, cheeky, and enthusiastic! Call them "legends," "dudes," "international adventure seekers," etc. Reference the guys by name with playful jabs that fit their personalities - tease Radu about crypto, joke about Churchill's Dubai lifestyle, reference the philosophical debate club (Tudor, Patrick, Emil, Ramon, Henning), make sailing jokes about Henning, party jokes about Tom, etc. 

Focus on outdoor adventures perfect for this eclectic international crew. Keep it energetic and fun - less backstory, more awesome BC advice with personality! ${
            parentMessageId 
              ? `This is a follow-up question to: "${conversation.find(msg => msg.id === parentMessageId)?.content}". Provide more details or related advice. `
              : ''
          }Here's their question: ${prompt}

Respond with a JSON object:
{
  "response": "Your cheeky, enthusiastic response with crew references and BC wisdom",
  "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],  
  "insider_tip": "A cheeky insider tip mentioning one of the guys by name/personality"
}`
        })
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      const parsedResponse = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
      setConversation(prev => [...prev, {
        id: Date.now(),
        type: 'nanook',
        content: parsedResponse.response,
        recommendations: parsedResponse.recommendations,
        insider_tip: parsedResponse.insider_tip,
        timestamp: Date.now(),
        reactions: [],
        parentId: parentMessageId
      }]);
    } catch (error) {
      console.error('Error:', error);
      setConversation(prev => [...prev, {
        id: Date.now(),
        type: 'nanook',
        content: "Sorry bros, had a technical hiccup there! Try asking again.",
        recommendations: [],
        insider_tip: "",
        timestamp: Date.now(),
        reactions: [],
        parentId: parentMessageId
      }]);
    }
    setIsLoading(false);
    setFollowUpQuestion('');
    setFollowUpMessageId(null);
  };

  const handleReaction = (messageId, emoji) => {
    setConversation(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: msg.reactions.includes(emoji) ? msg.reactions.filter(r => r !== emoji) : [...msg.reactions, emoji] }
        : msg
    ));
  };

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

  const quickQuestions = [
    "What are the most epic activities for our diverse route from desert to ocean?",
    "Hidden gems between Osoyoos wine country and Tofino beaches?",
    "Best RV camping spots and ferry booking tips for our route?",
    "What should we pack for desert, lakes, mountains AND ocean? (Philosophical debates included)",
    "Local wine, craft breweries, and food along our new route? (Henning's dive bar radar activated)",
    "Emergency backup plans if BC ferries are delayed? (Radu will probably suggest crypto trading while waiting)"
  ];

  const renderOverview = () => {
    const totalBudget = editableItinerary.reduce((sum, day) => sum + day.costs.activities + day.costs.accommodations, 0);

    return (
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
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <Mountain className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-bold text-orange-800">Desert to Ocean</h3>
            <p className="text-sm text-orange-700">Wine country, mountain lakes, Pacific surfing, and incredible diversity</p>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <Compass className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-bold text-blue-800">Hidden Gems</h3>
            <p className="text-sm text-blue-700">Hot springs, secret beaches, island adventures perfect for your crew</p>
          </div>
          
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-bold text-purple-800">Epic Experiences</h3>
            <p className="text-sm text-purple-700">Perfect for 10 international legends creating unforgettable memories</p>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">💰 Budget Planner</h3>
          <div className="space-y-4">
            <div className="text-sm">
              <p><strong>Total Estimated Cost:</strong> ${totalBudget.toFixed(2)}</p>
              <p className="mt-2"><strong>Breakdown by Day:</strong></p>
              <ul className="list-disc pl-5">
                {editableItinerary.map(day => (
                  <li key={day.day}>
                    Day {day.day} ({day.location}): Activities ${day.costs.activities.toFixed(2)}, Accommodations ${day.costs.accommodations.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Enter Estimated Costs:</h4>
              <div className="space-y-2">
                {editableItinerary.map((day, dayIndex) => (
                  <div key={day.day} className="flex items-center gap-2">
                    <span className="text-sm font-medium">Day {day.day} ({day.location}):</span>
                    <input
                      type="number"
                      value={day.costs.activities}
                      onChange={(e) => updateDayCosts(dayIndex, 'activities', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded w-24"
                      placeholder="Activities"
                      aria-label={`Activities cost for Day ${day.day}`}
                    />
                    <input
                      type="number"
                      value={day.costs.accommodations}
                      onChange={(e) => updateDayCosts(dayIndex, 'accommodations', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded w-24"
                      placeholder="Accommodations"
                      aria-label={`Accommodations cost for Day ${day.day}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">🌤️ Weather Forecast</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {locations.map(loc => (
              <div key={loc.name}>
                <strong>{loc.name}:</strong>
                {weatherData[loc.name]?.current ? (
                  <div>
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
                      {weatherData[loc.name].forecast?.map((f, idx) => (
                        <li key={idx}>{f.date}: {f.temp}°C, {f.condition}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>Weather data unavailable</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <h3 className="font-bold text-purple-800 mb-2">🤝 Group Coordination</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">Activity Assignments & Votes:</h4>
              {editableItinerary.map((day, dayIndex) => (
                <div key={day.day} className="mb-2">
                  <p className="text-sm font-medium">Day {day.day} ({day.location}):</p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
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
                              className={`text-xs ${day.votes[activityIndex]?.[friend] === 'up' ? 'text-green-600' : 'text-gray-400'}`}
                              aria-label={`Vote up for ${activity} by ${friend}`}
                            >
                              👍
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">Contributions:</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {friends.map(friend => (
                  <div key={friend}>
                    <strong>{friend}:</strong> {contributions[friend]?.length || 0} contributions
                    {contributions[friend]?.map((c, idx) => (
                      <p key={idx} className="text-xs text-gray-600">• ${c.amount} for {c.description}</p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-purple-700">Add Contribution:</h5>
                <div className="flex gap-2 mt-2">
                  <select
                    value={contributions.tempFriend || ''}
                    onChange={(e) => setContributions(prev => ({ ...prev, tempFriend: e.target.value }))}
                    className="px-2 py-1 border border-gray-300 rounded"
                    aria-label="Select friend for contribution"
                  >
                    <option value="">Select Friend</option>
                    {friends.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    className="px-2 py-1 border border-gray-300 rounded w-24"
                    onChange={(e) => setContributions(prev => ({ ...prev, tempAmount: parseFloat(e.target.value) || 0 }))}
                    aria-label="Contribution amount"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    className="px-2 py-1 border border-gray-300 rounded flex-1"
                    onChange={(e) => setContributions(prev => ({ ...prev, tempDescription: e.target.value }))}
                    aria-label="Contribution description"
                  />
                  <button
                    onClick={() => {
                      const { tempFriend, tempAmount, tempDescription } = contributions;
                      if (tempFriend && tempAmount && tempDescription) {
                        handleContribution(tempFriend, tempAmount, tempDescription);
                      }
                    }}
                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    aria-label="Add contribution"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
  };

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

        {showMap && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-t-xl p-4 text-white">
              <h3 className="text-lg font-bold">🗺️ Your BC Adventure Route</h3>
              <p className="text-sm opacity-90">Vancouver → Osoyoos → Kelowna → Pemberton → Tofino → Victoria → Vancouver</p>
            </div>
            <div 
              id="trip-map" 
              className="w-full h-96 rounded-b-xl border border-gray-200"
              style={{ minHeight: '400px' }}
            >
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600" role="alert" aria-live="polite">
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-2">🗺️ Loading your epic BC route...</p>
                    <p className="text-sm">Desert → Wine Country → Mountains → Ocean → Islands</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentItinerary.map((day, dayIndex) => (
          <div 
            key={day.day}
            className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
              selectedDay === day.day 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            } ${isEditing ? 'bg-yellow-50 border-yellow-300' : ''}`}
            onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {day.day}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <label htmlFor={`location-${dayIndex}`} className="sr-only">Location for Day {day.day}</label>
                      <input
                        id={`location-${dayIndex}`}
                        type="text"
                        value={day.location}
                        onChange={(e) => updateDay(dayIndex, 'location', e.target.value)}
                        className="font-bold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full"
                        placeholder="Location"
                      />
                      <label htmlFor={`highlight-${dayIndex}`} className="sr-only">Highlight for Day {day.day}</label>
                      <input
                        id={`highlight-${dayIndex}`}
                        type="text"
                        value={day.highlight}
                        onChange={(e) => updateDay(dayIndex, 'highlight', e.target.value)}
                        className="text-sm text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 w-full"
                        placeholder="Highlight"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-gray-800">{day.location}</h3>
                      <p className="text-sm text-gray-600">{day.highlight}</p>
                    </div>
                  )}
                </div>
              </div>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            
            {selectedDay === day.day && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-700">Today's Adventures:</h4>
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addActivity(dayIndex);
                      }}
                      className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      aria-label="Add new activity"
                    >
                      + Add Activity
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex gap-2">
                        <label htmlFor={`activity-${dayIndex}-${activityIndex}`} className="sr-only">Activity {activityIndex + 1} for Day {day.day}</label>
                        <input
                          id={`activity-${dayIndex}-${activityIndex}`}
                          type="text"
                          value={activity}
                          onChange={(e) => {
                            const updated = [...editableItinerary];
                            updated[dayIndex].activities[activityIndex] = e.target.value;
                            setEditableItinerary(updated);
                          }}
                          className="flex-1 bg-white rounded px-3 py-2 text-sm border border-gray-300"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeActivity(dayIndex, activityIndex);
                          }}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          aria-label={`Remove activity ${activityIndex + 1}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-2">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="bg-white rounded px-3 py-2 text-sm border border-gray-200">
                        {activity}
                      </div>
                    ))}
                  </div>
                )}
                
                {!isEditing && (
                  <div className="mt-3 space-y-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaude(`Tell me detailed plans for Day ${day.day} of our BC road trip: ${day.location}. What specific activities should we do? Make it fun and detailed for our international crew of 10 guys.`);
                      }}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Get detailed plans for Day ${day.day}`}
                    >
                      {isLoading ? 'Getting Plans...' : `Get Detailed Plans for Day ${day.day}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

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

      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Ask Nanook Anything:</h3>
        <div className="flex gap-2">
          <label htmlFor="custom-question" className="sr-only">Ask a question about the BC road trip</label>
          <input
            id="custom-question"
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Type your question (e.g., @Tom, book the ferry?)..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && customQuestion.trim()) {
                handleClaude(customQuestion);
                setCustomQuestion('');
              }
            }}
          />
          <button
            onClick={() => {
              if (customQuestion.trim()) {
                handleClaude(customQuestion);
                setCustomQuestion('');
              }
            }}
            disabled={isLoading || !customQuestion.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Submit question to Nanook"
          >
            Ask
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="text-blue-800">Nanook is getting you the best intel...</span>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {conversation.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>👋 Hey legends! Start chatting with me about your epic BC adventure!</p>
          </div>
        )}
        {conversation.map((message, idx) => (
          <div key={`msg-${message.id}-${idx}`} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            {message.type === 'nanook' && (
              <img 
                src="https://i.imgur.com/xtAl4ow.png" 
                alt="Nanook" 
                className="w-8 h-8 rounded-full mr-3 mt-1 flex-shrink-0"
              />
            )}
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{message.content || 'Loading...'}</p>
              
              {message.type === 'nanook' && message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">🎯 Recommendations:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {message.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {message.type === 'nanook' && message.insider_tip && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs bg-yellow-100 text-yellow-800 rounded p-2">
                    <span className="font-semibold">💡 Tip: </span>
                    {message.insider_tip}
                  </p>
                </div>
              )}

              {message.type === 'nanook' && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    {['👍', '😍', '😂', '🤯'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className={`text-sm ${message.reactions.includes(emoji) ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-500`}
                        aria-label={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                    {message.reactions.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {message.reactions.length} reaction{message.reactions.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setFollowUpMessageId(followUpMessageId === message.id ? null : message.id)}
                    className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded px-2 py-1 transition-colors"
                    aria-label="Reply to this message"
                  >
                    💬 Reply
                  </button>
                </div>
              )}

              {message.type === 'nanook' && followUpMessageId === message.id && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    <label htmlFor={`follow-up-${message.id}`} className="sr-only">Follow-up question</label>
                    <input
                      id={`follow-up-${message.id}`}
                      type="text"
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      placeholder="Ask a follow-up question..."
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && followUpQuestion.trim()) {
                          handleClaude(followUpQuestion, message.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (followUpQuestion.trim()) {
                          handleClaude(followUpQuestion, message.id);
                        }
                      }}
                      disabled={isLoading || !followUpQuestion.trim()}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      aria-label="Submit follow-up question"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 ml-3 mt-1 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">You</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-100 rounded-lg p-1">
        <h3 className="text-sm font-medium text-gray-600 mb-2 px-3 pt-2">Or try a quick question:</h3>
        <div className="grid md:grid-cols-2 gap-3 p-3">
          {quickQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleClaude(question)}
              className="bg-white hover:bg-gray-50 rounded-lg p-3 text-left text-sm font-medium transition-colors border border-gray-200"
              disabled={isLoading}
              aria-label={`Ask: ${question}`}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    );
  );

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
