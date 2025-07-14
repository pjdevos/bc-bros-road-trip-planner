
'use client'

import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Coffee, Mountain, Calendar, Users, Zap, Star, Map } from 'lucide-react';

const BCRoadTripPlanner = () => {
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

  const [currentSection, setCurrentSection] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableItinerary, setEditableItinerary] = useState(defaultItinerary);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentFunFact, setCurrentFunFact] = useState(null);

  // BC Fun Facts
  const bcFunFacts = [
    {
      title: "Raincouver Is Real",
      fact: "Vancouver gets so much rain that locals joke about owning multiple rain jackets, each for a different level of wetness — from 'misty drizzle' to 'horizontal sideways rain.'",
      tip: "☔ Locals don't even use umbrellas. That's how you spot a tourist."
    },
    {
      title: "'Sorry' Is a Way of Life", 
      fact: "In BC, if someone steps on your foot, you say sorry.",
      tip: "🙇‍♂️ Politeness levels are so high, it's practically a competitive sport."
    },
    {
      title: "You Can Ski and Tan in One Day",
      fact: "It's entirely possible (and bragged about often) to ski in the mountains and hit the beach on the same day in spring. Locals call it 'The West Coast Flex.'",
      tip: "🎿🏖️ Peak BC showing off right there."
    },
    {
      title: "It's Basically Hollywood North",
      fact: "Vancouver is so often used as a stand-in for American cities in movies that there are memes about it playing 'Every City But Itself.'",
      tip: "🎬 If you see New York on screen and think, 'Hmm, that skyline looks suspiciously like downtown Vancouver' — you're right."
    },
    {
      title: "Wildlife Is... a Bit Too Local",
      fact: "It's not unusual to see raccoons committing petty crimes in your garbage, seagulls stealing your fries with surgical precision, or a bear using your backyard as a shortcut to work.",
      tip: "🐻 BC: where wildlife comes to you."
    },
    {
      title: "Weed Was Legal Before It Was Legal",
      fact: "Let's be honest: BC Bud was famous worldwide long before Canada made cannabis legal. There were dispensaries operating before laws even caught up.",
      tip: "🌿 They call it 'the B.C. Bud loophole' — or just 'a Wednesday.'"
    },
    {
      title: "Bike Lanes Are Sacred",
      fact: "Don't you dare walk in the bike lane in Vancouver. You will be silently judged, politely warned, and possibly run over by a Lululemon-clad cyclist sipping oat milk.",
      tip: "🚴‍♀️ Respect the spandex warriors."
    },
    {
      title: "We Have Towns Named Peculiar Things",
      fact: "There's a small BC town called '100 Mile House', and it's exactly 100 miles from... something. Nobody's quite sure what anymore.",
      tip: "🏘️ Don't forget: Spuzzum, Skookumchuck, Funky Creek, and Osoyoos (which visitors can't pronounce)."
    },
    {
      title: "Real Estate Is a National Joke",
      fact: "A 500 sq ft condo in Vancouver costs more than a literal castle in Scotland. But hey — it comes with a shared laundry room and a 'peekaboo' view of the ocean if you lean out the window dangerously.",
      tip: "🏠💸 At least the air is free... for now."
    },
    {
      title: "Everyone Hikes, Even if They Hate It",
      fact: "If you live in BC and don't hike, you'll be gently shamed until you do. It's practically a religion.",
      tip: "⛰️ Haven't done the Grouse Grind? Get thee to the stairs, sinner."
    },
    {
      title: "The Unholy Love Affair with Sushi",
      fact: "Vancouver has more sushi restaurants per capita than Tokyo (really). It's totally normal to get sushi at gas stations or budget grocery stores. And sometimes… it's actually good.",
      tip: "🍣 BC Roll? Invented here — complete with imitation crab and cucumber, no shame."
    },
    {
      title: "People Treat Kale Like Currency",
      fact: "Farmers markets sell 10 kinds of kale. 'Would you like that smoothie with organic kale, local kale, or biodynamic ancestral kale?'",
      tip: "🥬 Don't insult kale in BC. Someone will overhear and uninvite you to their yoga retreat."
    },
    {
      title: "Salmon Is Basically a Religion",
      fact: "Smoked, candied, grilled, sockeye, chinook, you name it. There's even salmon candy (yes, sweet smoked fish), which is somehow delicious and confusing at the same time.",
      tip: "🐟 First Nations cuisine centers around wild salmon and it's treated with deep respect."
    },
    {
      title: "Weird Pizza Toppings Are Normal",
      fact: "Ever had pizza with smoked salmon and goat cheese? Or blueberries and arugula? In BC, that's just 'Tuesday.'",
      tip: "🍕 Pineapple on pizza is old news here. Bring on the fennel pollen and caramelized leeks."
    },
    {
      title: "Coffee Snobbery Is Next Level",
      fact: "You can't just say 'coffee.' It's a single-origin Guatemalan pour-over with oat milk, served in a reusable cup made of recycled hemp and vibes.",
      tip: "☕ Tim Hortons? Fine. But the third-wave, ethically-sourced café is where the soul lives."
    },
    {
      title: "BC Has Its Own Time Zone... Sort Of",
      fact: "Most of BC is on Pacific Time, but a tiny chunk in the northeast runs on Mountain Time. It's like BC couldn't decide what time zone it wanted to be in, so it said 'why not both?'",
      tip: "🕐 Don't be late for dinner in Fort St. John — you might be in the wrong time zone."
    },
    {
      title: "Orcas Are Basically Local Celebrities",
      fact: "BC's orcas have names, fan clubs, and Instagram accounts. People track them like celebrities and get genuinely excited when J35 or K25 shows up for a photo op.",
      tip: "🐋 Yes, you will be expected to know which pod you saw. No, 'the black and white one' is not specific enough."
    },
    {
      title: "Ferry Lineups Are a Social Event",
      fact: "BC Ferries lineups aren't just waiting — they're networking opportunities. People bring lawn chairs, barbecues, and full picnics. Some travelers have made lifelong friends in the Horseshoe Bay parking lot.",
      tip: "⛴️ Pro tip: The car deck coffee is surprisingly good, and the gift shop sells everything you forgot to pack."
    },
    {
      title: "Fleece Is Formal Wear",
      fact: "In BC, you can wear hiking boots and a Patagonia fleece to a wedding, and nobody bats an eye. In fact, you'll probably be overdressed if you wear actual dress shoes.",
      tip: "🧥 When in doubt, layer. Always layer. Even in summer."
    },
    {
      title: "Tim Hortons vs. Local Coffee Wars",
      fact: "BC has the most intense coffee shop loyalty in Canada. You're either a 'Timmies' person or a 'local roastery' person. There is no middle ground, and friendships have ended over it.",
      tip: "☕ Saying 'double-double' at a craft coffee shop will get you the stink eye of a lifetime."
    },
    {
      title: "The Grouse Grind Is a Cult",
      fact: "Vancouverites treat the Grouse Grind (a brutal 2.9km uphill hike) like a religion. People do it daily, track their times obsessively, and judge you based on your personal best.",
      tip: "⛰️ Under 45 minutes = respectable. Under 30 minutes = you're probably not human."
    },
    {
      title: "BC Wine Snobs Are Real",
      fact: "BC produces world-class wine, and locals will fight you about it. Mention California wine at an Okanagan tasting and watch the temperature drop faster than a Whistler chairlift.",
      tip: "🍷 Just nod and say 'terroir' — it works every time."
    },
    {
      title: "Everyone's a Weather Expert",
      fact: "BC residents can predict weather with supernatural accuracy. They'll tell you it's going to rain in exactly 23 minutes based on 'the way the mountains look' and be absolutely right.",
      tip: "🌧️ If a local says 'better bring a jacket,' you bring the jacket. No questions asked."
    },
    {
      title: "Cottage Cheese is Surprisingly Controversial",
      fact: "Ask for cottage cheese on your breakfast in BC and prepare for judgment. It's been replaced by Greek yogurt, chia seeds, and things with unpronounceable superfood names.",
      tip: "🥛 Hemp hearts are the new cottage cheese. Don't ask why."
    },
    {
      title: "BC Day Long Weekend Is Sacred",
      fact: "The first Monday in August (BC Day) isn't just a holiday — it's a mass exodus to camping spots. Book your site a year in advance or prepare to sleep in your car.",
      tip: "🏕️ If you don't have a reservation, your only hope is arriving at a campground at 6 AM and bribing someone with Tim Hortons."
    }
  ];

  const getRandomFunFact = () => {
    const randomIndex = Math.floor(Math.random() * bcFunFacts.length);
    setCurrentFunFact(bcFunFacts[randomIndex]);
  };

  // Simple map loader
  useEffect(() => {
    if (showMap && !mapLoaded) {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        createMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDqBGR6jfw1eatF7DYtpLdnhc-uQBdL40I`;
      script.onload = () => {
        setMapLoaded(true);
        setTimeout(createMap, 100);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps');
        showMapError();
      };

      document.head.appendChild(script);
    }
  }, [showMap]);

  const showMapError = () => {
    const mapElement = document.getElementById('trip-map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-100 text-gray-600">
          <div class="text-center p-8">
            <p class="text-lg font-semibold mb-2">🗺️ Map temporarily unavailable</p>
            <p class="text-sm mb-4">Your epic BC route:</p>
            <div class="text-left bg-white rounded-lg p-4 shadow-sm max-w-sm mx-auto">
              <div class="text-xs space-y-1">
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
    if (!window.google || !window.google.maps || !document.getElementById('trip-map')) {
      console.log('Google Maps not ready');
      return;
    }

    try {
      const map = new window.google.maps.Map(document.getElementById('trip-map'), {
        zoom: 6,
        center: { lat: 49.5, lng: -122.0 },
        mapTypeId: 'terrain'
      });

      // Route coordinates - fixed to include all days and avoid overlap
      const locations = [
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

      // Add markers
      locations.forEach(location => {
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

  const handleClaude = async (prompt) => {
    setIsLoading(true);
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

Focus on outdoor adventures perfect for this eclectic international crew. Keep it energetic and fun - less backstory, more awesome BC advice with personality! Here's their question: ${prompt}

Respond with a JSON object:
{
  "response": "Your cheeky, enthusiastic response with crew references and BC wisdom",
  "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],  
  "insider_tip": "A cheeky insider tip mentioning one of the guys by name/personality"
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
        <p className="text-lg">Markus's epic 40th birthday adventure! Desert wine country → Okanagan lakes → Pacific Ocean → Island paradise. 10 international legends, 10 unforgettable days!</p>
      </div>

      {/* Your epic custom RV image */}
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
        <h3 className="font-bold text-yellow-800 mb-2">⚡ Quick Trip Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><strong>Distance:</strong> ~1,500km + ferries</div>
          <div><strong>Best Time:</strong> July 2026</div>
          <div><strong>Group Size:</strong> 10 international legends</div>
          <div><strong>Vehicle:</strong> RV/Camper vans</div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={getRandomFunFact}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg"
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
            >
              🎲 Another Fun Fact!
            </button>
          </div>
        </div>
      )}
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
              <p className="text-sm opacity-90">Vancouver → Osoyoos → Kelowna → Pemberton → Tofino → Victoria → Vancouver</p>
            </div>
            <div 
              id="trip-map" 
              className="w-full h-96 rounded-b-xl border border-gray-200"
              style={{ minHeight: '400px' }}
            >
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600">
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
                        handleClaude(`Tell me detailed plans for Day ${day.day} of our BC road trip: ${day.location}. What specific activities should we do? Make it fun and detailed for our international crew of 10 guys.`);
                      }}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Getting Plans...' : `Get Detailed Plans for Day ${day.day}`}
                    </button>
                    
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
        <div className="flex items-center gap-4">
          <img 
            src="https://i.imgur.com/xtAl4ow.png" 
            alt="Nanook - Your BC Guide" 
            className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
          />
          <div>
            <h2 className="text-xl font-bold mb-1">🤙 Ask Nanook Anything!</h2>
            <p className="text-lg mb-1">Your cheeky BC guide with insider knowledge!</p>
            <p className="text-sm opacity-90">Former number-cruncher turned wilderness enthusiast. Ready to help you legends plan the most epic BC adventure ever!</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Ask Nanook Your Question:</h3>
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

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="text-blue-800">Nanook is getting you the best intel...</span>
          </div>
        </div>
      )}

      {/* Chat conversation display */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {conversation.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>👋 Hey legends! Ask me anything about your epic BC adventure!</p>
          </div>
        )}
        {conversation.map((message, idx) => (
          <div key={`msg-${idx}-${message.timestamp}`} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
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
              
              {message.type === 'nanook' && message.follow_up_question && (
                <div className="mt-2">
                  <button
                    onClick={() => handleClaude(message.follow_up_question)}
                    className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded px-2 py-1 transition-colors"
                    disabled={isLoading}
                  >
                    💬 {message.follow_up_question}
                  </button>
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
            <span className="text-blue-800">Nanook is getting you the best intel...</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {responses.slice().reverse().map((response, idx) => (
          <div key={responses.length - 1 - idx} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="font-semibold text-gray-800 mb-2">❓ {response.question}</div>
            <div className="text-gray-700 mb-3">{response.response}</div>
            
            {response.recommendations && response.recommendations.length > 0 && (
              <div className="mb-3">
                <h4 className="font-semibold text-gray-800 mb-1">🎯 Top Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {response.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {response.insider_tip && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <span className="font-semibold text-yellow-800">💡 Nanook's Insider Tip: </span>
                <span className="text-yellow-700">{response.insider_tip}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
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
        >
          <Coffee className="w-4 h-4 inline mr-1" />
          Ask Nanook
        </button>
      </div>

      {currentSection === 'overview' && renderOverview()}
      {currentSection === 'itinerary' && renderItinerary()}
      {currentSection === 'chat' && renderChat()}
    </div>
  );
};

export default BCRoadTripPlanner;
