'use client'

import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Coffee, Mountain, Calendar, Users, Zap, Star, Map } from 'lucide-react';

const BCRoadTripPlanner = () => {
  // Define the NEW itinerary (Osoyoos/Tofino route)
  const defaultItinerary = [
    { day: 1, location: "Vancouver → Osoyoos", highlight: "Desert wine country adventure", activities: ["Early departure from Vancouver", "Chilliwack supply stop", "Osoyoos Desert Centre", "Wine tasting in Canada's only desert"] },
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

  // State variables
  const [currentSection, setCurrentSection] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableItinerary, setEditableItinerary] = useState(defaultItinerary);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps when needed
  useEffect(() => {
    if (showMap && !mapLoaded) {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        setTimeout(initializeMap, 200);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDqBGR6jfw1eatF7DYtpLdnhc-uQBdL40I&libraries=geometry&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Create a global callback function
      window.initGoogleMaps = () => {
        setMapLoaded(true);
        setTimeout(initializeMap, 300);
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps');
        showMapFallback();
      };

      document.head.appendChild(script);
    }
  }, [showMap, mapLoaded]);

  const showMapFallback = () => {
    const mapElement = document.getElementById('trip-map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-100 text-gray-600">
          <div class="text-center p-8">
            <p class="text-lg font-semibold mb-2">🗺️ Your BC Adventure Route</p>
            <div class="text-left bg-white rounded-lg p-4 shadow-sm max-w-sm">
              <p class="text-sm text-blue-600 font-medium mb-2">10-Day Journey:</p>
              <div class="text-xs space-y-1">
                <div>📍 Day 1: Vancouver → Osoyoos (Desert wine country)</div>
                <div>📍 Day 2-3: Osoyoos → Kelowna (Okanagan Lake)</div>
                <div>📍 Day 4: Kelowna → Pemberton (Mountains)</div>
                <div>📍 Day 5-6: Pemberton → Tofino (Pacific Ocean)</div>
                <div>📍 Day 7-8: Tofino → Victoria (Capital city)</div>
                <div>📍 Day 9-10: Victoria → Vancouver (Journey home)</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  };

  // Initialize Google Maps
  const initializeMap = () => {
    if (!window.google || !window.google.maps || !document.getElementById('trip-map')) {
      console.log('Google Maps not ready yet');
      return;
    }

    try {
      const coordinates = {
        1: { lat: 49.2827, lng: -123.1207, name: "Vancouver" },
        2: { lat: 49.0325, lng: -119.4525, name: "Osoyoos" },
        3: { lat: 49.8880, lng: -119.4960, name: "Kelowna" },
        4: { lat: 50.3192, lng: -122.7948, name: "Pemberton" },
        5: { lat: 49.1533, lng: -125.9060, name: "Tofino" },
        6: { lat: 49.1533, lng: -125.9060, name: "Tofino" },
        7: { lat: 48.4284, lng: -123.3656, name: "Victoria" },
        8: { lat: 48.4284, lng: -123.3656, name: "Victoria" },
        9: { lat: 49.1666, lng: -121.9833, name: "Cultus Lake" },
        10: { lat: 49.2827, lng: -123.1207, name: "Vancouver" }
      };

      const map = new window.google.maps.Map(document.getElementById('trip-map'), {
        zoom: 6,
        center: { lat: 49.0, lng: -123.0 },
        mapTypeId: 'terrain',
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add custom markers for each day
      const currentItinerary = isEditing ? editableItinerary : defaultItinerary;
      currentItinerary.forEach((day) => {
        const coord = coordinates[day.day];
        if (coord) {
          const marker = new window.google.maps.Marker({
            position: coord,
            map: map,
            title: `Day ${day.day}: ${day.location}`,
            label: {
              text: day.day.toString(),
              color: 'white',
              fontWeight: 'bold'
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 5px 0; color: #1f2937;">Day ${day.day}</h3>
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #3B82F6;">${day.location}</p>
                <p style="margin: 0 0 8px 0; color: #6b7280;">${day.highlight}</p>
                <div style="font-size: 12px; color: #6b7280;">
                  <strong>Activities:</strong><br>
                  • ${day.activities.join('<br>• ')}
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }
      });

      // Add driving directions
      try {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true, // We already have custom markers
          polylineOptions: {
            strokeColor: '#3B82F6',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });
        directionsRenderer.setMap(map);

        const waypoints = [];
        for (let i = 2; i <= 9; i++) {
          waypoints.push({
            location: coordinates[i],
            stopover: true
          });
        }

        directionsService.route({
          origin: coordinates[1],
          destination: coordinates[10],
          waypoints: waypoints,
          optimizeWaypoints: false,
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          } else {
            console.log('Directions request failed:', status);
          }
        });
      } catch (error) {
        console.log('Directions service failed, but markers still work:', error);
      }

    } catch (error) {
      console.error('Error initializing map:', error);
      showMapFallback();
    }
  };

  // Handle Claude API calls
  const handleClaude = async (prompt) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `You are the ultimate BC road trip guide for a legendary group of 10 guys doing a camper van adventure in July 2026. This is a 40th birthday trip for Markus (the birthday boy - he's Canadian/German and the whole reason for this epic BC adventure!). 

THE CREW (with all their quirks):
- Markus (the birthday boy - turning 40!) Canadian/German, father of Emmy and Rafael, Green party centrist, not a fan of zionism
- Thomas (Tom) - French/Irish, loves parties and raves, single and liberal, the party animal
- Ramon - Dutch/Peruvian, speaks Spanish, UFC wrestling fan, loves philosophical discussions  
- Alex (goes by Churchill) - speaks Chinese, loves England, grew up in Belgium, lives in Dubai
- Emil - Swedish Arctic hillbilly, loves football and left-wing politics, philosophical thinker
- Henning - German/Dutch, sailing enthusiast, works for Groningen regional government, Schützenfest lover, football fan, beer connoisseur, dive bar expert, Social Democrat, philosophical discussions
- Patrick (Paddy) - Irish, eternally young Peter Pan type, loves travel, electronic music, parties, and philosophy
- Serban (goes by Radu) - Austrian/Romanian, youngest (under 30), crypto/gambling enthusiast, womanizer, grew up in Vienna, Tudor's brother-in-law
- Tudor - Romanian/Dutch, Liberal, worked for European People's Party, Radu's brother-in-law, loves philosophical discussions
- Pieter (P-J) - the oldest at 46, Belgian, liberal, worked for Belgian government, the wise elder

Be fun, cheeky, and enthusiastic. Reference these guys by name with playful jabs that fit their personalities - tease Radu about crypto, joke about Churchill's Dubai lifestyle, reference the philosophical debate club (Tudor, Patrick, Emil, Ramon, Henning), make sailing jokes about Henning, party jokes about Tom, etc. Focus on outdoor adventures perfect for this eclectic international crew.

Here's what they want to know: ${prompt}

Respond with a JSON object:
{
  "response": "Your fun, detailed response with cheeky personality-based references to the crew",
  "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],  
  "insider_tip": "A cheeky insider tip, definitely mentioning one of the guys by name/personality"
}

Your entire response MUST be valid JSON only.`
        })
      });

      const data = await response.json();
      const parsedResponse = JSON.parse(data.response);
      setResponses(prev => [...prev, { question: prompt, ...parsedResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setResponses(prev => [...prev, { 
        question: prompt, 
        response: "Sorry bros, had a technical hiccup there! Try asking again.", 
        recommendations: [],
        insider_tip: ""
      }]);
    }
    setIsLoading(false);
  };

  const quickQuestions = [
    "What are the most epic activities for our diverse route from desert to ocean?",
    "Hidden gems between Osoyoos wine country and Tofino beaches?",
    "Best RV camping spots and ferry booking tips for our route?",
    "What should we pack for desert, lakes, mountains AND ocean? (Philosophical debates included)",
    "Local wine, craft breweries, and food along our new route? (Henning's dive bar radar activated)",
    "Emergency backup plans if BC ferries are delayed? (Radu will probably suggest crypto trading while waiting)"
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🏔️ The Ultimate BC Bro-Trip</h2>
        <p className="text-lg">Markus's epic 40th birthday adventure! Desert wine country → Okanagan lakes → Pacific Ocean → Island paradise. 10 international legends, 10 unforgettable days through BC's best!</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <Mountain className="w-8 h-8 text-orange-600 mb-2" />
          <h3 className="font-bold text-orange-800">Desert to Ocean</h3>
          <p className="text-sm text-orange-700">Wine country, mountain lakes, Pacific surfing, and more diversity than you can handle</p>
        </div>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <Compass className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-bold text-blue-800">Hidden Gems</h3>
          <p className="text-sm text-blue-700">Hot springs, secret beaches, island adventures, and places perfect for your international crew</p>
        </div>
        
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <Users className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-bold text-purple-800">Epic Experiences</h3>
          <p className="text-sm text-purple-700">Perfect for 10 international legends who want to create unforgettable memories</p>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">⚡ Quick Trip Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><strong>Distance:</strong> ~1,500km + ferries</div>
          <div><strong>Best Time:</strong> July 2026</div>
          <div><strong>Group Size:</strong> 10 international legends</div>
          <div><strong>Vehicle:</strong> RV/Camper vans</div>
        </div>
      </div>
    </div>
  );

  const renderItinerary = () => {
    const currentItinerary = isEditing ? editableItinerary : defaultItinerary;
    
    const updateDay = (dayIndex, field, value) => {
      const updated = [...editableItinerary];
      if (field === 'activities') {
        updated[dayIndex].activities = value.split(',').map(a => a.trim()).filter(a => a);
      } else {
        updated[dayIndex][field] = value;
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
      setEditableItinerary([...defaultItinerary]);
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
            >
              <Map className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Show Route Map'}
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={resetItinerary}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditableItinerary([...defaultItinerary]);
                  setIsEditing(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
              <p className="text-sm opacity-90">Click markers to see daily details • Blue line shows your driving route</p>
            </div>
            <div 
              id="trip-map" 
              className="w-full h-96 rounded-b-xl border border-gray-200"
              style={{ minHeight: '400px' }}
            />
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
                      <input
                        type="text"
                        value={day.location}
                        onChange={(e) => updateDay(dayIndex, 'location', e.target.value)}
                        className="font-bold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full"
                        placeholder="Location"
                      />
                      <input
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
                    >
                      + Add Activity
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    {day.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex gap-2">
                        <input
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
                        handleClaude(`Tell me detailed plans for Day ${day.day} of our BC road trip: ${day.location}. What specific activities should we do? Any hidden gems or unexpected stops? Make it fun and detailed for our group of 10 international legends.`);
                      }}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Getting Plans...' : `Get Detailed Plans for Day ${day.day}`}
                    </button>
                    
                    {/* Show responses for this specific day */}
                    {responses.filter(response => 
                      response.question.includes(`Day ${day.day}`) || 
                      response.question.includes(day.location)
                    ).map((response, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                        <div className="font-semibold text-green-800 mb-2">🗺️ Detailed Plans for Day {day.day}</div>
                        <div className="text-green-700 mb-3">{response.response}</div>
                        
                        {response.recommendations && response.recommendations.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-semibold text-green-800 mb-1">🎯 Top Recommendations:</h4>
                            <ul className="list-disc list-inside text-sm text-green-700">
                              {response.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {response.insider_tip && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <span className="font-semibold text-yellow-800">💡 Insider Tip: </span>
                            <span className="text-yellow-700">{response.insider_tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
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
        <h2 className="text-xl font-bold mb-2">🤙 Ask Your BC Guide Anything!</h2>
        <p>Got questions about your epic road trip? I've got the insider knowledge to make this trip legendary.</p>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Ask Your Own Question:</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Type your question about the BC road trip..."
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
          >
            Ask
          </button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-1">
        <h3 className="text-sm font-medium text-gray-600 mb-2 px-3 pt-2">Or choose a quick question:</h3>
        <div className="grid md:grid-cols-2 gap-3 p-3">
          {quickQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleClaude(question)}
              className="bg-white hover:bg-gray-50 rounded-lg p-3 text-left text-sm font-medium transition-colors border border-gray-200"
              disabled={isLoading}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="text-blue-800">Getting you the best intel...</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {responses.map((response, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="font-sem
