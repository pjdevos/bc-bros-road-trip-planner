import React, { useState, useEffect } from 'react';

const BCRoadTripPlanner = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentSection, setCurrentSection] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [currentFunFact, setCurrentFunFact] = useState(null);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [showWeatherDetails, setShowWeatherDetails] = useState({});
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showDaySummary, setShowDaySummary] = useState({});
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const friends = ["Markus", "Tom", "Ramon", "Churchill", "Emil", "Henning", "Paddy", "Radu", "Tudor", "P-J"];

  const loginCodes = {
    "EPIC40": "Markus",
    "FRENCHIE": "Tom", 
    "CRYPTO": "Radu",
    "DUBAI": "Churchill",
    "SWEDEN": "Emil",
    "SAILING": "Henning",
    "PETERPAN": "Paddy",
    "ROMANIA": "Tudor",
    "BELGIUM": "P-J",
    "UFC": "Ramon"
  };

  const defaultItinerary = [
    { 
      day: 1, 
      location: "Vancouver → Osoyoos", 
      highlight: "Desert wine country adventure", 
      activities: ["Early departure from Vancouver", "Chilliwack supply stop", "Osoyoos Desert Centre", "Wine tasting"],
      summary: "Welcome to Canada's only desert! Start your epic journey by trading Vancouver's rain for Osoyoos sunshine. Hit the Desert Centre to learn why this place exists (spoiler: it's weird and wonderful), then dive into wine country. Pro tip: pace yourselves, legends - this is day 1 of 10!"
    },
    { 
      day: 2, 
      location: "Osoyoos → Kelowna", 
      highlight: "Okanagan Lake paradise", 
      activities: ["Nk'Mip Desert Cultural Centre", "Drive along Okanagan Lake", "Fintry Provincial Park setup", "Lakeside swimming"],
      summary: "Lake life begins! Drive the stunning Okanagan Lake route (Churchill, your camera will thank you). Fintry Provincial Park is your basecamp - think crystal clear water perfect for swimming and enough space for philosophical debates. The lake's so clear you can probably see Radu's crypto portfolio from the bottom!"
    },
    { 
      day: 3, 
      location: "Kelowna Rest Day", 
      highlight: "Wine tours and lake activities", 
      activities: ["Local winery visits", "Big White Scenic Chairlift", "Okanagan Lake water sports", "Downtown Kelowna"],
      summary: "Wine country mastery day! Hit the wineries (designated driver rotation recommended), ride the Big White chairlift for mountain views, and master some lake sports. Downtown Kelowna has great food - perfect for Emil to start debates with locals about Canadian politics vs. Swedish socialism!"
    },
    { 
      day: 4, 
      location: "Kelowna → Pemberton", 
      highlight: "Mountain valley transition", 
      activities: ["Coquihalla Highway drive", "Nairn Falls Provincial Park", "Nairn Falls hike", "Mountain photography"],
      summary: "Mountain magic time! The Coquihalla Highway is one of Canada's most scenic drives - perfect for the philosophical debate club to solve world problems. Nairn Falls hike is about 1.5km each way to a spectacular waterfall. Henning can pretend he's navigating fjords!"
    },
    { 
      day: 5, 
      location: "Pemberton → Tofino", 
      highlight: "Sea-to-Sky to Pacific Ocean", 
      activities: ["Sea-to-Sky Highway", "Horseshoe Bay ferry", "Cathedral Grove", "First Pacific sunset"],
      summary: "From mountains to ocean! The Sea-to-Sky Highway lives up to its name, then ferry time (Henning's sailing expertise finally useful). Cathedral Grove has 800-year-old trees that'll make you feel tiny. Your first Pacific sunset in Tofino will be legendary - perfect Instagram moment for the whole crew!"
    },
    { 
      day: 6, 
      location: "Tofino Adventures", 
      highlight: "Surf, whales, and hot springs", 
      activities: ["Surfing lessons", "Hot Springs Cove boat tour", "Whale watching", "Rainforest boardwalk trails"],
      summary: "Peak West Coast vibes! Tom's surfing moment has arrived (any level of success counts as victory). Hot Springs Cove is accessed by boat - natural hot springs in the wilderness. Whale watching is prime season, and the rainforest walks are perfect for deep conversations and Bigfoot spotting!"
    },
    { 
      day: 7, 
      location: "Tofino → Victoria", 
      highlight: "West coast to capital city", 
      activities: ["Final Tofino beach walk", "Drive through Island interior", "Goldstream Provincial Park", "Victoria Inner Harbour"],
      summary: "Wild coast to refined capital! One last Tofino beach moment, then drive through Vancouver Island's interior (surprisingly different landscapes). Victoria's Inner Harbour is postcard-perfect - ideal for Churchill's fancy photography and the group's 'we're cultured travelers' shots!"
    },
    { 
      day: 8, 
      location: "Victoria Exploration", 
      highlight: "Gardens and royal treatment", 
      activities: ["Butchart Gardens", "Royal BC Museum", "Inner Harbour stroll", "Beacon Hill Park peacocks"],
      summary: "Classy Victoria day! Butchart Gardens is world-famous for good reason - even the guys will admit it's beautiful. Royal BC Museum for some culture, Inner Harbour for fancy vibes, and Beacon Hill Park where peacocks roam free and photobomb tourists (watch your snacks!)."
    },
    { 
      day: 9, 
      location: "Victoria → Vancouver", 
      highlight: "Ferry crossing finale", 
      activities: ["Swartz Bay to Tsawwassen ferry", "Optional Cultus Lake stop", "Trip reflection", "Final group dinner"],
      summary: "Journey's end approaches! The big ferry back to mainland - perfect time for trip reflection and planning the reunion. Optional Cultus Lake stop for one last BC moment. Final group dinner to celebrate surviving 10 days together and Markus turning 40 like a legend!"
    },
    { 
      day: 10, 
      location: "Vancouver Return", 
      highlight: "Epic journey complete", 
      activities: ["RV return and cleanup", "Final supply run", "Airport departures", "Legendary memories made"],
      summary: "Mission accomplished! RV cleanup (good luck), final supply run for souvenirs, and the bittersweet airport goodbyes. You've conquered BC from desert to ocean, survived 10 days of international crew dynamics, and given Markus an unforgettable 40th. Legend status: achieved!"
    }
  ];

  const locations = [
    { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
    { name: "Osoyoos", lat: 49.0325, lng: -119.4525 },
    { name: "Kelowna", lat: 49.8880, lng: -119.4960 },
    { name: "Pemberton", lat: 50.3192, lng: -122.7948 },
    { name: "Tofino", lat: 49.1533, lng: -125.9060 },
    { name: "Victoria", lat: 48.4284, lng: -123.3656 }
  ];

  const [editableItinerary] = useState(
    defaultItinerary.map(day => ({ ...day, costs: { activities: 0, accommodations: 0 }, assignments: {}, votes: {} }))
  );

  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "What's our priority for the Okanagan Valley?",
      options: ["Wine tasting marathon", "Lake activities & swimming", "Mix of both wine and water"],
      votes: {},
      active: true
    },
    {
      id: 2,
      question: "Tofino accommodation preference?",
      options: ["Camping under the stars", "Cozy cabin rental", "Surf lodge/hostel vibes"],
      votes: {},
      active: true
    },
    {
      id: 3,
      question: "Victoria evening activity?",
      options: ["Pub crawl downtown", "Butchart Gardens night tour", "Inner Harbour sunset stroll"],
      votes: {},
      active: true
    }
  ]);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', '', ''] });

  const [expenses, setExpenses] = useState([
    { id: 1, description: "RV Rental Deposit", amount: 500, paidBy: "Markus", splitBetween: friends, date: "2026-07-01" },
    { id: 2, description: "Ferry Tickets", amount: 280, paidBy: "Tom", splitBetween: friends, date: "2026-07-05" }
  ]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitBetween: [...friends],
    date: new Date().toISOString().split('T')[0]
  });

  const [emergencyInfo] = useState({
    emergency: [
      { name: "Emergency Services", number: "911", description: "Police, Fire, Ambulance" },
      { name: "BC Emergency Health Services", number: "1-866-332-2274", description: "Non-emergency health advice" }
    ],
    roadside: [
      { name: "CAA British Columbia", number: "1-800-CAA-HELP", description: "24/7 roadside assistance" },
      { name: "BCAA Emergency Road Service", number: "604-293-2222", description: "Vancouver area emergency" }
    ]
  });

  const [photoBoard, setPhotoBoard] = useState({
    sharedAlbumLink: "",
    instagramHashtag: "#BCBros2026",
    challenges: [
      { id: 1, challenge: "Group photo with a bear warning sign", assignedTo: "", completed: false, completedBy: "", proof: "" },
      { id: 2, challenge: "Someone surfing (or attempting to surf)", assignedTo: "", completed: false, completedBy: "", proof: "" },
      { id: 3, challenge: "All 10 guys at a winery", assignedTo: "", completed: false, completedBy: "", proof: "" },
      { id: 4, challenge: "Markus with birthday cake somewhere epic", assignedTo: "", completed: false, completedBy: "", proof: "" },
      { id: 5, challenge: "Ferry selfie with the whole crew", assignedTo: "", completed: false, completedBy: "", proof: "" }
    ],
    messages: [
      { id: 1, author: "Markus", message: "Can't wait for this epic adventure! 🎉", timestamp: Date.now() - 86400000 }
    ]
  });

  // Online/offline detection and initial conversation setup
  useEffect(() => {
    if (currentUser && conversation.length === 0) {
      setConversation([
        {
          id: Date.now(),
          type: 'guide',
          content: `Hey ${currentUser}! 🤙 Welcome to your BC adventure planning hub, legend! I'm Nanook, your cheeky BC guide and former number-cruncher turned wilderness enthusiast. 

Whether you need tips on the best surf spots in Tofino (Tom, looking at you!), wine recommendations in the Okanagan, or just want to know where Churchill can get his fancy Dubai-style coffee in the Canadian wilderness, I've got you covered!

What can I help you international adventure seekers with today? 🏔️🌊`,
          recommendations: [
            "Ask about hidden gems along your route",
            "Get tips for the best photo spots (Churchill will thank me)",
            "Learn about can't-miss activities for each destination"
          ],
          insider_tip: "Pro tip: Start with the Okanagan wine questions - P-J's Belgian taste buds will appreciate the quality!",
          timestamp: Date.now()
        }
      ]);
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator?.onLine || true);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [currentUser, conversation.length]);

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
      title: "Bears Know Traffic Rules",
      fact: "BC has around 120,000-160,000 black bears, and they've learned that highways provide easy travel routes. Some bears have been spotted 'hitchhiking' by following cars on mountain roads!",
      tip: "🐻 Always keep food locked up when camping, and yes, that includes toothpaste!"
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
    }
  ];

  const quickQuestions = [
    "What are the must-see hidden gems between stops?",
    "Best restaurants for our crew of 10?",
    "Where can we find the best craft beer?",
    "Tips for ferry bookings and timing?",
    "Wildlife safety tips for city boys?",
    "Best photo spots for Churchill's Instagram?"
  ];

  const getRandomFunFact = () => {
    const randomIndex = Math.floor(Math.random() * bcFunFacts.length);
    setCurrentFunFact(bcFunFacts[randomIndex]);
  };

  // Working chat function based on the "Fixed" version
  const handleChat = async (question) => {
    if (!question.trim()) return;
    
    if (!isOnline) {
      setConversation(prev => [...prev, {
        id: Date.now(),
        type: 'guide',
        content: "Whoa, legends! Looks like we're offline. Check back when you've got signal, and I'll hook you up with epic BC advice!",
        recommendations: [],
        insider_tip: "",
        timestamp: Date.now()
      }]);
      return;
    }
    
    setIsLoading(true);
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: Date.now()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setCustomQuestion('');
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `You are Nanook, a cheeky and enthusiastic BC tour guide helping plan an epic road trip. You're a former accountant turned wilderness guide with a great sense of humor and genuine love for BC's wild beauty. You're helping Markus's legendary 40th birthday crew (THE INTERNATIONAL LEGENDS: Markus Canadian/German birthday boy, Tom French/Irish party animal, Ramon Dutch/Peruvian UFC fan, Churchill Dubai expat, Emil Swedish leftie, Henning German/Dutch sailing enthusiast, Paddy Irish Peter Pan, Radu youngest crypto enthusiast, Tudor Romanian/Dutch liberal, P-J oldest Belgian government worker) plan their epic BC road trip in July 2026. 

Be fun, cheeky, and enthusiastic! Call them "legends," "dudes," "international adventure seekers," etc. Reference the guys by name with playful jabs that fit their personalities - tease Radu about crypto, joke about Churchill's Dubai lifestyle, reference the philosophical debate club (Tudor, Patrick, Emil, Ramon, Henning), make sailing jokes about Henning, party jokes about Tom, etc. 

Focus on outdoor adventures perfect for this eclectic international crew. Keep it energetic and fun - less backstory, more awesome BC advice with personality! 

Here's their question: ${question}

Respond with a JSON object:
{
  "response": "Your cheeky, enthusiastic response with crew references and BC wisdom",
  "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],
  "insider_tip": "A cheeky insider tip mentioning one of the guys by name/personality"
}

Your entire response MUST be valid JSON only.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        try {
          // Handle Claude API JSON responses with markdown stripping
          let responseText = data.content[0].text;
          responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const nanookResponse = JSON.parse(responseText);
          
          const guideMessage = {
            id: Date.now() + 1,
            type: 'guide',
            content: nanookResponse.response,
            recommendations: nanookResponse.recommendations || [],
            insider_tip: nanookResponse.insider_tip || "",
            timestamp: Date.now()
          };
          
          setConversation(prev => [...prev, guideMessage]);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          // If JSON parsing fails, use the raw response
          const guideMessage = {
            id: Date.now() + 1,
            type: 'guide',
            content: data.content[0].text,
            recommendations: [],
            insider_tip: "",
            timestamp: Date.now()
          };
          
          setConversation(prev => [...prev, guideMessage]);
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error calling Claude API:', error);
      
      // Show a helpful message that encourages trying again
      const helpMessage = {
        id: Date.now() + 1,
        type: 'guide',
        content: `Hey ${currentUser}! 🤙 My connection to the BC wisdom database got a bit wobbly there. Give it another shot, legend - I've got tons of epic advice waiting for you international adventure seekers!`,
        recommendations: [
          "Try asking your question again",
          "Check one of the quick questions below",
          "Browse the itinerary for detailed trip info"
        ],
        insider_tip: "Sometimes the best adventures need a second attempt!",
        timestamp: Date.now()
      };
      
      setConversation(prev => [...prev, helpMessage]);
    }
    
    setIsLoading(false);
  };

  const addPhotoChallenge = () => {
    if (newChallenge.trim()) {
      const challenge = {
        id: Date.now(),
        challenge: newChallenge.trim(),
        assignedTo: "",
        completed: false,
        completedBy: "",
        proof: ""
      };
      setPhotoBoard(prev => ({
        ...prev,
        challenges: [...prev.challenges, challenge]
      }));
      setNewChallenge("");
      setShowAddChallenge(false);
    }
  };

  const assignChallenge = (challengeId, person) => {
    setPhotoBoard(prev => ({
      ...prev,
      challenges: prev.challenges.map(challenge =>
        challenge.id === challengeId ? { ...challenge, assignedTo: person } : challenge
      )
    }));
  };

  const completeChallenge = (challengeId, completedBy, proof = "") => {
    setPhotoBoard(prev => {
      const challengeText = prev.challenges.find(c => c.id === challengeId)?.challenge;
      const updatedChallenges = prev.challenges.map(challenge =>
        challenge.id === challengeId 
          ? { ...challenge, completed: true, completedBy, proof }
          : challenge
      );
      
      const celebrationMessage = {
        id: Date.now(),
        author: "App",
        message: `🎉 ${completedBy} completed: "${challengeText}"!`,
        timestamp: Date.now()
      };
      
      return {
        ...prev,
        challenges: updatedChallenges,
        messages: [...prev.messages, celebrationMessage]
      };
    });
  };

  const createPoll = () => {
    const trimmedQuestion = newPoll.question.trim();
    const trimmedOptions = newPoll.options.filter(opt => opt.trim());
    
    if (trimmedQuestion && trimmedOptions.length >= 2) {
      const poll = {
        id: Date.now(),
        question: trimmedQuestion,
        options: trimmedOptions,
        votes: {},
        active: true
      };
      setPolls(prev => [...prev, poll]);
      setNewPoll({ question: '', options: ['', '', ''] });
      setShowCreatePoll(false);
    }
  };

  const closePoll = (pollId) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId ? { ...poll, active: false } : poll
    ));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = loginCodes[loginCode.toUpperCase()];
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setLoginCode('');
    } else {
      setLoginError('Invalid access code. Check with the group chat!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setConversation([]);
  };

  const handleVote = (pollId, optionIndex) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { ...poll, votes: { ...poll.votes, [currentUser]: optionIndex } }
        : poll
    ));
  };

  const addExpense = () => {
    const amount = parseFloat(newExpense.amount);
    if (newExpense.description.trim() && !isNaN(amount) && amount > 0 && newExpense.paidBy && newExpense.splitBetween.length > 0) {
      const expense = {
        id: Date.now(),
        description: newExpense.description.trim(),
        amount: amount,
        paidBy: newExpense.paidBy,
        splitBetween: [...newExpense.splitBetween],
        date: newExpense.date
      };
      setExpenses(prev => [...prev, expense]);
      setNewExpense({
        description: '',
        amount: '',
        paidBy: '',
        splitBetween: [...friends],
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddExpense(false);
    }
  };

  const toggleSplitPerson = (person) => {
    setNewExpense(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(person)
        ? prev.splitBetween.filter(p => p !== person)
        : [...prev.splitBetween, person]
    }));
  };

  const calculateBalances = () => {
    const balances = {};
    friends.forEach(friend => balances[friend] = 0);

    expenses.forEach(expense => {
      const shareAmount = expense.amount / expense.splitBetween.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitBetween.forEach(person => {
        balances[person] -= shareAmount;
      });
    });

    return balances;
  };

  const getDebts = () => {
    const balances = calculateBalances();
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([person, balance]) => {
      if (balance > 0.01) creditors.push({ person, amount: balance });
      if (balance < -0.01) debtors.push({ person, amount: -balance });
    });

    const debts = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      const amount = Math.min(creditor.amount, debtor.amount);

      if (amount > 0.01) {
        debts.push({
          from: debtor.person,
          to: creditor.person,
          amount: amount
        });
      }

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return debts;
  };

  const toggleWeatherDetails = (locationName) => {
    setShowWeatherDetails(prev => ({
      ...prev,
      [locationName]: !prev[locationName]
    }));
  };

  const addMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        author: currentUser,
        message: newMessage.trim(),
        timestamp: Date.now()
      };
      setPhotoBoard(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
      setNewMessage("");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🚐 BC Bros Road Trip</h1>
            <p className="text-gray-600">Markus's Epic 40th Birthday Adventure</p>
            <p className="text-sm text-gray-500 mt-2">July 2026 • 10 International Legends</p>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            Version 2.1 • Created July 30, 2025 at 3:47 PM UTC
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Access Code:
              </label>
              <input
                id="access-code"
                type="text"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                placeholder="e.g., EPIC40, CRYPTO, SAILING..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-bold uppercase"
              />
              {loginError && (
                <p className="text-red-600 text-sm mt-2">{loginError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
            >
              Join The Adventure! 🎉
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Access Codes:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><strong>EPIC40:</strong> Markus</div>
              <div><strong>FRENCHIE:</strong> Tom</div>
              <div><strong>UFC:</strong> Ramon</div>
              <div><strong>DUBAI:</strong> Churchill</div>
              <div><strong>SWEDEN:</strong> Emil</div>
              <div><strong>SAILING:</strong> Henning</div>
              <div><strong>PETERPAN:</strong> Paddy</div>
              <div><strong>CRYPTO:</strong> Radu</div>
              <div><strong>ROMANIA:</strong> Tudor</div>
              <div><strong>BELGIUM:</strong> P-J</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🚐 BC Bros Road Trip Planner
            </h1>
            <p className="text-gray-600">July 2026 • 10 Days • Markus's 40th Birthday • International Legends</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome back,</p>
            <p className="font-bold text-blue-600">{currentUser}! 👋</p>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-700 underline mt-1"
            >
              Logout
            </button>
          </div>
        </div>
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
          ⭐ Overview
        </button>
        <button
          onClick={() => setCurrentSection('itinerary')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            currentSection === 'itinerary'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📅 Itinerary
        </button>
        <button
          onClick={() => setCurrentSection('chat')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            currentSection === 'chat'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ☕ Chat with Nanook
        </button>
      </div>

      {currentSection === 'overview' && (
        <div className="space-y-6">
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

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-yellow-800">💰 Expense Tracker</h3>
              <button
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                {showAddExpense ? 'Cancel' : '+ Add Expense'}
              </button>
            </div>

            {showAddExpense && (
              <div className="mb-6 p-4 bg-white border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-700 mb-3">Add New Expense</h4>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <select
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, paidBy: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Who paid?</option>
                      {friends.map(friend => (
                        <option key={friend} value={friend}>{friend}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Split between:</label>
                    <div className="flex flex-wrap gap-2">
                      {friends.map(friend => (
                        <button
                          key={friend}
                          type="button"
                          onClick={() => toggleSplitPerson(friend)}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            newExpense.splitBetween.includes(friend)
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {friend}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={addExpense}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Add Expense
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-yellow-700">Recent Expenses:</h4>
              {expenses.slice(-3).reverse().map(expense => (
                <div key={expense.id} className="bg-white p-3 rounded border border-yellow-200">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-600">Paid by {expense.paidBy}</p>
                    </div>
                    <p className="font-bold">${expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded border border-yellow-200">
              <h4 className="font-semibold text-yellow-700 mb-3">Who Owes What:</h4>
              {getDebts().length === 0 ? (
                <p className="text-green-600">Everyone's even!</p>
              ) : (
                <div className="space-y-2">
                  {getDebts().map((debt, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{debt.from} owes {debt.to}</span>
                      <span className="font-bold">${debt.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-purple-800">🗳️ Group Polls</h3>
              <button
                onClick={() => setShowCreatePoll(!showCreatePoll)}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                {showCreatePoll ? 'Cancel' : '+ New Poll'}
              </button>
            </div>

            {showCreatePoll && (
              <div className="mb-6 p-4 bg-white border border-purple-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Poll question..."
                  value={newPoll.question}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                />
                {newPoll.options.map((option, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Option ${idx + 1}...`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newPoll.options];
                      newOptions[idx] = e.target.value;
                      setNewPoll(prev => ({ ...prev, options: newOptions }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  />
                ))}
                <button
                  onClick={createPoll}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Create Poll
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              {polls.map(poll => (
                <div key={poll.id} className="bg-white p-4 rounded border border-purple-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{poll.question}</h4>
                    {poll.active && (
                      <button
                        onClick={() => closePoll(poll.id)}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                      >
                        Close
                      </button>
                    )}
                  </div>
                  {poll.options.map((option, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between">
                        <span>{option}</span>
                        <span className="text-sm text-gray-500">
                          {Object.values(poll.votes).filter(v => v === idx).length} votes
                        </span>
                      </div>
                      {poll.active && (
                        <button
                          onClick={() => handleVote(poll.id, idx)}
                          className={`mt-1 text-xs px-3 py-1 rounded ${
                            poll.votes[currentUser] === idx
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {poll.votes[currentUser] === idx ? '✓ Voted' : 'Vote'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={getRandomFunFact}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🤯 BC Fun Facts
            </button>
          </div>

          {currentFunFact && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-purple-800 mb-2">{currentFunFact.title}</h3>
              <p className="text-purple-700 mb-3">{currentFunFact.fact}</p>
              <p className="text-purple-800 font-medium">{currentFunFact.tip}</p>
              <button
                onClick={() => setCurrentFunFact(null)}
                className="mt-4 text-purple-600 hover:text-purple-800"
              >
                Close
              </button>
            </div>
          )}

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">🌤️ Weather Forecast</h3>
            <div className="grid md:grid-cols-3 gap-2 text-sm">
              {locations.map(loc => (
                <div key={loc.name} className="border border-blue-200 rounded p-2 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleWeatherDetails(loc.name)}
                    className="flex items-center justify-between w-full text-left hover:bg-blue-50 p-1 rounded"
                  >
                    <strong className="text-blue-800">{loc.name}</strong>
                    <span>{showWeatherDetails[loc.name] ? '▲' : '▼'}</span>
                  </button>
                  
                  {showWeatherDetails[loc.name] && (
                    <div className="mt-2 pt-2 border-t border-blue-100">
                      <p className="text-xs">Current: 22°C, Sunny ☀️</p>
                      <p className="mt-1 text-xs font-semibold">5-Day Forecast:</p>
                      <ul className="text-xs list-disc pl-3">
                        <li>Day 1: 24°C, Sunny</li>
                        <li>Day 2: 26°C, Partly Cloudy</li>
                        <li>Day 3: 23°C, Light Rain</li>
                        <li>Day 4: 25°C, Sunny</li>
                        <li>Day 5: 27°C, Clear</li>
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">* Weather data is simulated for demo purposes</p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-800 mb-4">🚨 Emergency Contacts & Important Info</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">🚑</span>
                  Emergency Services
                </h4>
                <div className="space-y-2">
                  {emergencyInfo.emergency.map((contact, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-red-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.description}</p>
                        </div>
                        <a 
                          href={`tel:${contact.number}`}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-red-700"
                        >
                          {contact.number}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">🚗</span>
                  Roadside Assistance
                </h4>
                <div className="space-y-2">
                  {emergencyInfo.roadside.map((contact, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-red-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.description}</p>
                        </div>
                        <a 
                          href={`tel:${contact.number}`}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-yellow-700"
                        >
                          {contact.number}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  BC Emergency Tips
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>No cell service?</strong> Many BC areas have spotty coverage - download offline maps!</li>
                  <li>• <strong>Wildlife encounters:</strong> Never approach bears - make noise, back away slowly</li>
                  <li>• <strong>Ferry delays:</strong> Check BC Ferries app for real-time updates</li>
                  <li>• <strong>Medical:</strong> Nearest hospitals may be hours away in remote areas</li>
                  <li>• <strong>Weather changes fast:</strong> Always carry emergency supplies in your vehicle</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentSection === 'itinerary' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">🗺️ Your 10-Day Adventure</h2>
            <button
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              🗺️ {showMap ? 'Hide Map' : 'Show Route Map'}
            </button>
          </div>

          {showMap && (
            <div className="mb-6 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">🗺️ Your BC Adventure Route</h3>
                    <p className="text-sm opacity-90">Vancouver → Osoyoos → Kelowna → Pemberton → Tofino → Victoria → Vancouver</p>
                  </div>
                  <a
                    href="https://www.google.com/maps/dir/Vancouver,+BC/Osoyoos,+BC/Kelowna,+BC/Pemberton,+BC/Tofino,+BC/Victoria,+BC/Vancouver,+BC/@49.5,-123,6z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-blue-600 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                  >
                    <span>📱</span>
                    Open in Google Maps
                  </a>
                </div>
              </div>
              <div className="w-full h-96 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                  <p className="text-2xl font-bold mb-4 text-gray-800">🗺️ Epic BC Road Trip Route</p>
                  <p className="text-lg text-gray-600 mb-6">Your legendary 2,200km journey through British Columbia!</p>
                  
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="grid md:grid-cols-2 gap-4 text-left">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 mb-2">📍 Route Breakdown:</h4>
                        <div className="text-sm space-y-1 text-gray-700">
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span><strong>Day 1:</strong> Vancouver → Osoyoos<br/>
                            <span className="text-xs text-gray-500">400km, 5 hours - Desert wine country</span></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span><strong>Day 2:</strong> Osoyoos → Kelowna<br/>
                            <span className="text-xs text-gray-500">120km, 2 hours - Lake paradise</span></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span><strong>Day 4:</strong> Kelowna → Pemberton<br/>
                            <span className="text-xs text-gray-500">330km, 4 hours - Mountain valleys</span></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span><strong>Day 5:</strong> Pemberton → Tofino<br/>
                            <span className="text-xs text-gray-500">280km + ferry, 6 hours - Pacific Ocean</span></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span><strong>Day 7:</strong> Tofino → Victoria<br/>
                            <span className="text-xs text-gray-500">315km, 4.5 hours - Capital city</span></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span><strong>Day 9:</strong> Victoria → Vancouver<br/>
                            <span className="text-xs text-gray-500">Ferry crossing, 3.5 hours - Journey's end</span></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">📊 Trip Statistics:</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Total Distance:</strong> ~2,200 km</p>
                            <p><strong>Driving Time:</strong> ~25 hours</p>
                            <p><strong>Ferry Crossings:</strong> 2 major routes</p>
                            <p><strong>Elevation Change:</strong> Sea level to 2,000m+</p>
                          </div>
                        </div>
                        
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Book ferries in advance!</li>
                            <li>• Check road conditions</li>
                            <li>• Download offline maps</li>
                            <li>• Keep gas tank above 1/2</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {editableItinerary.map((day) => (
            <div
              key={day.day}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedDay === day.day
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="font-bold">{day.location}</h3>
                    <p className="text-sm text-gray-600">{day.highlight}</p>
                  </div>
                </div>
              </div>

              {selectedDay === day.day && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Activities:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                    {day.activities.map((activity, idx) => (
                      <li key={idx}>{activity}</li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDaySummary(prev => ({
                        ...prev,
                        [day.day]: !prev[day.day]
                      }));
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    {showDaySummary[day.day] ? 'Hide' : 'Show'} Day Summary
                  </button>
                  
                  {showDaySummary[day.day] && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{day.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentSection === 'chat' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-1">🤙 Chat with Nanook!</h2>
            <p className="text-lg">Your cheeky BC guide with insider knowledge!</p>
            {!isOnline && (
              <div className="mt-2 p-2 bg-red-500 bg-opacity-20 rounded">
                ⚠️ You're offline! Chat will work once you're back online.
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {conversation.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 ${
                  msg.type === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-3xl ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className={msg.type === 'user' ? 'text-white' : 'text-gray-800'}>
                    {msg.content}
                  </p>
                  
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="font-semibold text-sm mb-2">Recommendations:</p>
                      <ul className="list-disc list-inside text-sm">
                        {msg.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {msg.insider_tip && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                      <p className="text-sm text-yellow-800">
                        <strong>Insider Tip:</strong> {msg.insider_tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="text-center text-gray-500">
                <p>Nanook is thinking... 🤔</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleChat(question)}
                className="text-left p-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask Nanook anything..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && customQuestion.trim()) {
                  handleChat(customQuestion);
                }
              }}
            />
            <button
              onClick={() => handleChat(customQuestion)}
              disabled={isLoading || !customQuestion.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BCRoadTripPlanner;