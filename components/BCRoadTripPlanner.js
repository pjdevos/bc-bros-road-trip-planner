"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { differenceInDays, parse } from 'date-fns';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Constants moved to top to avoid ReferenceError
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

const BCRoadTripPlanner = () => {
  // State definitions
  const [currentUser, setCurrentUser] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentSection, setCurrentSection] = useState('overview');
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : false);
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

  // Debounce hook for localStorage writes
  const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
    return (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    };
  };

  // Save to localStorage with error handling
  const saveToLocalStorage = useDebounce((key, value) => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        const total = Object.keys(localStorage).reduce((sum, k) => sum + ((localStorage[k].length + k.length) * 2), 0);
        if (total > 5 * 1024 * 1024) {
          setConversation(prev => [
            ...prev,
            {
              id: Date.now(),
              type: 'nanook',
              content: 'Heads up, legends! Your device storage is getting full. Consider exporting chats or clearing old photos!',
              recommendations: [],
              insider_tip: '',
              timestamp: Date.now(),
              reactions: [],
            },
          ]);
        }
      } catch (error) {
        console.error(`localStorage error for ${key}:`, error);
        setConversation(prev => [
          ...prev,
          {
            id: Date.now(),
            type: 'nanook',
            content: 'Oops, legends! Trouble saving data. Your device storage might be full. Try clearing some space!',
            recommendations: [],
            insider_tip: '',
            timestamp: Date.now(),
            reactions: [],
          },
        ]);
      }
    }
  }, 500);

  // Load state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        const savedUser = localStorage.getItem('bcTripUser');
        if (savedUser) setCurrentUser(savedUser);
        const cachedItinerary = localStorage.getItem('bcRoadTripItinerary');
        const cachedConversation = localStorage.getItem('bcRoadTripConversation');
        const cachedWeather = localStorage.getItem('bcRoadTripWeather');
        const cachedPolls = localStorage.getItem('bcRoadTripPolls');
        const cachedPhotos = localStorage.getItem('bcRoadTripPhotos');
        const cachedPhotoBoard = localStorage.getItem('bcRoadTripPhotoBoard');
        if (cachedItinerary) setEditableItinerary(JSON.parse(cachedItinerary));
        if (cachedConversation) {
          const parsed = JSON.parse(cachedConversation);
          if (parsed.length > 50) {
            setConversation(prev => [
              ...prev,
              {
                id: Date.now(),
                type: 'nanook',
                content: 'Heads up, legends! Showing only the last 50 messages to keep things speedy. Want older chats? Ask me to export them!',
                recommendations: [],
                insider_tip: '',
                timestamp: Date.now(),
                reactions: [],
              },
            ]);
          }
          setConversation(parsed.slice(-50));
        }
        if (cachedWeather) setWeatherData(JSON.parse(cachedWeather));
        if (cachedPolls) setPolls(JSON.parse(cachedPolls));
        if (cachedPhotos) setPhotoChallenges(JSON.parse(cachedPhotos));
        if (cachedPhotoBoard) setPhotoBoard(JSON.parse(cachedPhotoBoard));
        const isRecent = cachedWeather && Object.values(JSON.parse(cachedWeather)).every(
          data => Date.now() - data.lastUpdated < 60 * 60 * 1000
        );
        if (!isRecent) fetchWeatherData();
      } catch (error) {
        console.error('localStorage load error:', error);
        setConversation(prev => [
          ...prev,
          {
            id: Date.now(),
            type: 'nanook',
            content: 'Trouble loading data from storage. Your device might be low on space!',
            recommendations: [],
            insider_tip: '',
            timestamp: Date.now(),
            reactions: [],
          },
        ]);
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => setIsOnline(true));
      window.addEventListener('offline', () => setIsOnline(false));
      return () => {
        window.removeEventListener('online', () => setIsOnline(true));
        window.removeEventListener('offline', () => setIsOnline(false));
      };
    }
  }, []);

  // Fetch weather data
  const fetchWeatherData = async () => {
    if (!isOnline) return;
    setIsLoading(true);
    const API_KEY = 'b4852d0dab1e53207f5a738c8564f18b';
    const newWeatherData = {};
    try {
      for (const loc of locations) {
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lng}&appid=${API_KEY}&units=metric`
        );
        if (!currentResponse.ok) throw new Error(`Weather API error for ${loc.name}`);
        const currentData = await currentResponse.json();
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${loc.lat}&lon=${loc.lng}&appid=${API_KEY}&units=metric`
        );
        if (!forecastResponse.ok) throw new Error(`Forecast API error for ${loc.name}`);
        const forecastData = await forecastResponse.json();
        const dailyForecast = [];
        const seenDates = new Set();
        for (const item of forecastData.list) {
          const date = item.dt_txt.split(' ')[0];
          if (!seenDates.has(date) && dailyForecast.length < 5) {
            seenDates.add(date);
            dailyForecast.push({
              date,
              temp: Math.round(item.main.temp),
              description: item.weather[0].description,
            });
          }
          if (dailyForecast.length === 5) break;
        }
        newWeatherData[loc.name] = {
          current: { temp: Math.round(currentData.main.temp), description: currentData.weather[0].description },
          forecast: dailyForecast,
          lastUpdated: Date.now(),
        };
      }
      setWeatherData(newWeatherData);
      saveToLocalStorage('bcRoadTripWeather', newWeatherData);
    } catch (error) {
      console.error('Weather fetch error:', error);
      setConversation(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'nanook',
          content: `Whoa, legends! Couldn't fetch the latest weather for BC. Using cached data if available. Try again later!`,
          recommendations: [],
          insider_tip: 'Always pack a rain jacket in BC, no matter what the forecast says!',
          timestamp: Date.now(),
          reactions: [],
        },
      ]);
    }
    setIsLoading(false);
  };

  // Login
  const handleLogin = () => {
    if (!loginCode.trim()) {
      setLoginError('Please enter a login code.');
      return;
    }
    const user = loginCodes[loginCode.toUpperCase()];
    if (user) {
      setCurrentUser(user);
      setLoginCode('');
      setLoginError('');
      saveToLocalStorage('bcTripUser', user);
    } else {
      setLoginError('Invalid code. Try again, legend!');
    }
  };

  // Export conversation
  const exportConversation = () => {
    if (typeof window !== 'undefined') {
      const dataStr = JSON.stringify(conversation, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bc_road_trip_conversation.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Itinerary save/reset
  const saveItinerary = () => {
    setIsEditing(false);
    setConversation(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'nanook',
        content: 'Itinerary saved, legends! Ready for the road trip!',
        recommendations: [],
        insider_tip: '',
        timestamp: Date.now(),
        reactions: [],
      },
    ]);
  };

  const resetItinerary = () => {
    setEditableItinerary(
      defaultItinerary.map(day => ({
        ...day,
        costs: { activities: 0, accommodations: 0 },
        assignments: {}
      }))
    );
    setIsEditing(false);
    setConversation(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'nanook',
        content: 'Itinerary reset to default. Start planning again, legends!',
        recommendations: [],
        insider_tip: '',
        timestamp: Date.now(),
        reactions: [],
      },
    ]);
  };

  // Expense Tracker
  const addExpense = () => {
    if (
      newExpense.description.trim() &&
      !isNaN(newExpense.amount) &&
      newExpense.amount > 0 &&
      newExpense.paidBy &&
      friends.includes(newExpense.paidBy) &&
      newExpense.splitBetween.length > 0 &&
      newExpense.date
    ) {
      const expense = {
        id: Date.now(),
        description: newExpense.description.trim(),
        amount: parseFloat(newExpense.amount),
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
    } else {
      alert('Please fill in all fields correctly: valid description, positive amount, valid payer (from friends list), and at least one person to split with.');
    }
  };

  const calculateBalances = () => {
    const balances = friends.reduce((acc, friend) => ({ ...acc, [friend]: 0 }), {});
    expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitBetween.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitBetween.forEach(person => {
        balances[person] -= splitAmount;
      });
    });
    return balances;
  };

  const getDebts = () => {
    const balances = calculateBalances();
    const debts = [];
    const epsilon = 0.01;
    Object.entries(balances).forEach(([creditor, balance]) => {
      if (balance > epsilon) {
        Object.entries(balances).forEach(([debtor, debtorBalance]) => {
          if (debtorBalance < -epsilon) {
            const amount = Math.min(balance, -debtorBalance);
            if (amount > epsilon) {
              debts.push({ from: debtor, to: creditor, amount: amount.toFixed(2) });
              balances[creditor] -= amount;
              balances[debtor] += amount;
            }
          }
        });
      }
    });
    return debts;
  };

  const calculateTotalEstimatedCosts = () => {
    return editableItinerary.reduce((total, day) => {
      return total + (day.costs.activities || 0) + (day.costs.accommodations || 0);
    }, 0);
  };

  const calculateActualExpensesPerDay = () => {
    const expensesByDay = {};
    editableItinerary.forEach(day => {
      expensesByDay[day.day] = 0;
    });
    expenses.forEach(expense => {
      const expenseDate = parse(expense.date, 'yyyy-MM-dd', new Date());
      const tripStart = parse('2026-07-01', 'yyyy-MM-dd', new Date());
      const expenseDay = differenceInDays(expenseDate, tripStart) + 1;
      const itineraryDay = editableItinerary.find(day => expenseDay === day.day);
      if (itineraryDay) {
        expensesByDay[itineraryDay.day] += expense.amount / expense.splitBetween.length;
      }
    });
    return expensesByDay;
  };

  // Polls
  const createPoll = () => {
    const validOptions = newPoll.options.filter(opt => opt.trim());
    if (newPoll.question.trim() && validOptions.length >= 2) {
      const poll = {
        id: Date.now(),
        question: newPoll.question.trim(),
        options: validOptions,
        votes: {},
        active: true
      };
      setPolls(prev => [...prev, poll]);
      setNewPoll({ question: '', options: ['', '', ''] });
      setShowCreatePoll(false);
    } else {
      alert('Please provide a question and at least two non-empty options.');
    }
  };

  const handleVote = (pollId, optionIndex) => {
    if (!currentUser) return;
    setPolls(prev =>
      prev.map(poll =>
        poll.id === pollId && poll.active
          ? { ...poll, votes: { ...poll.votes, [currentUser]: optionIndex } }
          : poll
      )
    );
  };

  const closePoll = (pollId) => {
    setPolls(prev =>
      prev.map(poll =>
        poll.id === pollId ? { ...poll, active: false } : poll
      )
    );
  };

  // Photo Challenges
  const addChallenge = () => {
    if (newChallenge.description.trim() && newChallenge.assignedTo.length > 0) {
      setPhotoChallenges(prev => [
        ...prev,
        {
          id: Date.now(),
          description: newChallenge.description.trim(),
          assignedTo: [...newChallenge.assignedTo],
          completedBy: [],
          thumbnail: '',
          timestamp: null
        },
      ]);
      setNewChallenge({ description: '', assignedTo: [] });
      setShowAddChallenge(false);
    } else {
      alert('Please provide a description and assign at least one person.');
    }
  };

  const completeChallenge = (challengeId) => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = 100;
              canvas.height = 100;
              ctx.drawImage(img, 0, 0, 100, 100);
              const thumbnail = canvas.toDataURL('image/jpeg', 0.5);
              setPhotoChallenges(prev =>
                prev.map(challenge =>
                  challenge.id === challengeId
                    ? { ...challenge, thumbnail, completedBy: [...challenge.completedBy, currentUser], timestamp: Date.now() }
                    : challenge
                )
              );
              setPhotoBoard(prev => ({
                messages: [
                  ...prev.messages,
                  {
                    id: Date.now(),
                    content: `${currentUser} completed the "${photoChallenges.find(c => c.id === challengeId).description}" challenge! 🎉 (Full photo storage coming soon with Google Photos)`,
                    timestamp: Date.now(),
                    reactions: [],
                  },
                ],
              }));
            };
          };
          reader.readAsDataURL(file);
        }
      };
      fileInput.click();
    }
  };

  const handleReaction = (messageId, emoji, isPhotoBoard = false) => {
    if (isPhotoBoard) {
      setPhotoBoard(prev => ({
        messages: prev.messages.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: msg.reactions.includes(emoji)
                  ? msg.reactions.filter(r => r !== emoji)
                  : [...msg.reactions, emoji]
              }
            : msg
        ),
      }));
    } else {
      setConversation(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: msg.reactions.includes(emoji)
                  ? msg.reactions.filter(r => r !== emoji)
                  : [...msg.reactions, emoji]
              }
            : msg
        )
      );
    }
  };

  // Chat with Nanook
  const mockClaudeResponses = [
    {
      query: /recommend.*activity/i,
      response: 'How about a hike in Stanley Park? Epic views and good vibes!',
      recommendations: ['Stanley Park Seawall', 'Grouse Grind'],
      insider_tip: 'Bring comfy shoes; the trails can be rugged!'
    },
    {
      query: /food.*recommend/i,
      response: 'You gotta try some poutine in Vancouver! It’s a Canadian classic.',
      recommendations: ['Fritz European Fry House', 'La Belle Patate'],
      insider_tip: 'Ask for extra cheese curds for the full experience!'
    },
    {
      query: /.*/i,
      response: 'Hmm, not sure about that one, legends! Try asking about activities or food.',
      recommendations: [],
      insider_tip: 'BC’s got surprises around every corner—keep exploring!'
    }
  ];

  const handleClaude = async (message) => {
    if (!isOnline) {
      return {
        content: 'I’m offline, legends! Ask me something when we’re back online.',
        recommendations: [],
        insider_tip: 'Always have a map handy for offline adventures!'
      };
    }
    try {
      const response = mockClaudeResponses.find(r => r.query.test(message)) || mockClaudeResponses[mockClaudeResponses.length - 1];
      return {
        content: response.response,
        recommendations: response.recommendations,
        insider_tip: response.insider_tip
      };
    } catch (error) {
      console.error('Claude error:', error);
      return {
        content: 'Whoops, Nanook tripped over a cable! Try asking again.',
        recommendations: [],
        insider_tip: 'BC’s weather changes fast—pack layers!'
      };
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      recommendations: [],
      insider_tip: '',
      timestamp: Date.now(),
      reactions: [],
    };
    setConversation(prev => [...prev, userMessage]);
    setNewMessage('');
    const claudeResponse = await handleClaude(newMessage);
    setConversation(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'nanook',
        content: claudeResponse.content,
        recommendations: claudeResponse.recommendations,
        insider_tip: claudeResponse.insider_tip,
        timestamp: Date.now(),
        reactions: [],
      },
    ]);
  };

  // Persist state to localStorage
  useEffect(() => {
    saveToLocalStorage('bcRoadTripItinerary', editableItinerary);
    saveToLocalStorage('bcRoadTripConversation', conversation.slice(-50));
    saveToLocalStorage('bcRoadTripWeather', weatherData);
    saveToLocalStorage('bcRoadTripPolls', polls);
    saveToLocalStorage('bcRoadTripPhotos', photoChallenges);
    saveToLocalStorage('bcRoadTripPhotoBoard', photoBoard);
    if (currentUser) saveToLocalStorage('bcTripUser', currentUser);
  }, [editableItinerary, conversation, weatherData, polls, photoChallenges, photoBoard, currentUser]);

  // Render
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white min-h-screen">
      {!currentUser ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Login to BC Bros Road Trip</h2>
            <input
              type="text"
              placeholder="Enter your login code"
              value={loginCode ?? ''}
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
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">🚐 BC Bros Road Trip Planner</h1>
                <p className="text-gray-600">July 2026 • 10 Days • Markus's 40th Birthday • International Legends</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-bold text-blue-600">{currentUser}! 👋</p>
                <button
                  onClick={() => {
                    setCurrentUser('');
                    if (typeof window !== 'undefined' && localStorage) {
                      localStorage.removeItem('bcTripUser');
                    }
                  }}
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
                currentSection === 'overview' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ⭐ Overview
            </button>
            <button
              onClick={() => setCurrentSection('itinerary')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                currentSection === 'itinerary' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📅 Itinerary
            </button>
            <button
              onClick={() => setCurrentSection('chat')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                currentSection === 'chat' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ☕ Chat with Nanook
            </button>
            <button
              onClick={() => setCurrentSection('photos')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                currentSection === 'photos' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📸 Photos
            </button>
            <button
              onClick={() => setCurrentSection('map')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                currentSection === 'map' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🗺️ Map
            </button>
          </div>

          {currentSection === 'overview' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">🌤️ Weather Forecast</h3>
                <div className="grid md:grid-cols-3 gap-2 text-sm">
                  {locations.map(loc => (
                    <div key={loc.name} className="border border-blue-200 rounded p-2 bg-white">
                      <button
                        onClick={() => {
                          setShowWeatherDetails(prev => ({ ...prev, [loc.name]: !prev[loc.name] }));
                          if (isOnline && (!weatherData[loc.name] || Date.now() - weatherData[loc.name].lastUpdated > 60 * 60 * 1000)) {
                            fetchWeatherData();
                          }
                        }}
                        className="flex items-center justify-between w-full text-left hover:bg-blue-50 p-1 rounded"
                      >
                        <strong className="text-blue-800">{loc.name}</strong>
                        <span>{showWeatherDetails[loc.name] ? '▲' : '▼'}</span>
                      </button>
                      {showWeatherDetails[loc.name] && (
                        <div className="mt-2 pt-2 border-t border-blue-100">
                          {weatherData[loc.name] ? (
                            <>
                              <p className="text-xs">
                                Current: {weatherData[loc.name].current.temp}°C,{' '}
                                {weatherData[loc.name].current.description.charAt(0).toUpperCase() +
                                  weatherData[loc.name].current.description.slice(1)
                                }
                              </p>
                              <p className="mt-1 text-xs font-semibold">5-Day Forecast:</p>
                              <ul className="text-xs list-disc pl-3">
                                {weatherData[loc.name].forecast.map((day, idx) => (
                                  <li key={day.date}>
                                    {new Date(day.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                    : {day.temp}°C, {day.description.charAt(0).toUpperCase() + day.description.slice(1)}
                                  </li>
                                ))}
                              </ul>
                              <p className="text-xs text-gray-500 mt-1">
                                Last updated:{' '}
                                {new Date(weatherData[loc.name].lastUpdated).toLocaleTimeString()}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-600">
                              {isOnline ? 'Loading weather data...' : 'Offline: No weather data available'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                          placeholder="Description (e.g., Gas, Food)"
                          value={newExpense.description ?? ''}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={newExpense.amount ?? ''}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <select
                          value={newExpense.paidBy ?? ''}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, paidBy: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="" disabled>Select payer</option>
                          {friends.map(friend => (
                            <option key={friend} value={friend}>{friend}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={newExpense.date ?? new Date().toISOString().split('T')[0]}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Split between:</p>
                        <div className="flex flex-wrap gap-2">
                          {friends.map(friend => (
                            <button
                              key={friend}
                              onClick={() =>
                                setNewExpense(prev => ({
                                  ...prev,
                                  splitBetween: prev.splitBetween.includes(friend)
                                    ? prev.splitBetween.filter(f => f !== friend)
                                    : [...prev.splitBetween, friend]
                                }))
                              }
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
                        <p className="text-xs text-gray-500 mt-1">
                          Split {newExpense.splitBetween.length} ways = ${newExpense.amount && !isNaN(newExpense.amount) ? (parseFloat(newExpense.amount) / newExpense.splitBetween.length).toFixed(2) : '0.00'} each
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addExpense}
                          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          Add Expense
                        </button>
                        <button
                          onClick={() => setShowAddExpense(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-yellow-700">Recent Expenses:</h4>
                  {expenses.length === 0 ? (
                    <p className="text-gray-500 text-sm">No expenses yet. Add one to get started!</p>
                  ) : (
                    expenses.slice(-5).reverse().map(expense => (
                      <div key={expense.id} className="bg-white p-3 rounded border border-yellow-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{expense.description}</p>
                            <p className="text-sm text-gray-600">
                              Paid by <strong>{expense.paidBy}</strong> • Split {expense.splitBetween.length} ways
                            </p>
                            <p className="text-xs text-gray-500">{expense.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-yellow-800">${expense.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-600">${(expense.amount / expense.splitBetween.length).toFixed(2)} each</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="bg-white p-4 rounded border border-yellow-200">
                  <h4 className="font-semibold text-yellow-700 mb-3">Budget Summary:</h4>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <strong>Total Estimated Costs:</strong> ${calculateTotalEstimatedCosts().toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Total Actual Expenses:</strong> ${expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Difference:</strong> $
                      {(calculateTotalEstimatedCosts() - expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)).toFixed(2)}
                      {(calculateTotalEstimatedCosts() - expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)) > 0
                        ? ' (under budget)'
                        : ' (over budget)'}
                    </div>
                    <div>
                      <button
                        onClick={() => setShowBudgetBreakdown(!showBudgetBreakdown)}
                        className="flex items-center gap-2 text-yellow-700 font-semibold hover:text-yellow-800"
                      >
                        {showBudgetBreakdown ? '▲' : '▼'} Individual Balances
                      </button>
                      {showBudgetBreakdown && (
                        <div className="mt-2 grid md:grid-cols-2 gap-2">
                          {Object.entries(calculateBalances()).map(([person, balance]) => (
                            <div
                              key={person}
                              className={`p-2 rounded text-sm ${
                                Math.abs(balance) < 0.01
                                  ? 'bg-gray-100 text-gray-600'
                                  : balance > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <strong>{person}:</strong> ${balance.toFixed(2)}
                              {balance > 0.01 && ' (to receive)'}
                              {balance < -0.01 && ' (to pay)'}
                            </div>
                          ))}
                          {getDebts().length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700">Who Owes What:</p>
                              <ul className="text-sm text-gray-600 list-disc pl-5">
                                {getDebts().map((debt, idx) => (
                                  <li key={idx}>
                                    {debt.from} owes {debt.to} ${debt.amount}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-purple-800">📊 Polls</h3>
                  <button
                    onClick={() => setShowCreatePoll(!showCreatePoll)}
                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  >
                    {showCreatePoll ? 'Cancel' : '+ Create Poll'}
                  </button>
                </div>
                {showCreatePoll && (
                  <div className="mb-6 p-4 bg-white border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-3">Create New Poll</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Poll question"
                        value={newPoll.question ?? ''}
                        onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                      {newPoll.options.map((option, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={option ?? ''}
                          onChange={(e) => {
                            const newOptions = [...newPoll.options];
                            newOptions[idx] = e.target.value;
                            setNewPoll(prev => ({ ...prev, options: newOptions }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      ))}
                      <div className="flex gap-2">
                        <button
                          onClick={createPoll}
                          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          Create Poll
                        </button>
                        <button
                          onClick={() => setShowCreatePoll(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {polls.length === 0 ? (
                    <p className="text-gray-500 text-sm">No polls yet. Create one to vote!</p>
                  ) : (
                    polls.map(poll => {
                      const totalVotes = Object.keys(poll.votes).length;
                      return (
                        <div key={poll.id} className="bg-white p-3 rounded border border-purple-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-gray-800">{poll.question}</p>
                            {poll.active && (
                              <button
                                onClick={() => closePoll(poll.id)}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                              >
                                Close Poll
                              </button>
                            )}
                          </div>
                          {totalVotes === 0 ? (
                            <p className="text-sm text-gray-600">No votes yet.</p>
                          ) : (
                            poll.options.map((option, idx) => {
                              const voteCount = Object.values(poll.votes).filter(v => v === idx).length;
                              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                              return (
                                <div key={option} className="mb-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span>{option}</span>
                                    <span>{voteCount} votes ({percentage.toFixed(0)}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="bg-purple-600 h-2.5 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  {poll.active && (
                                    <button
                                      onClick={() => handleVote(poll.id, idx)}
                                      className={`mt-1 px-3 py-1 text-sm rounded ${
                                        poll.votes[currentUser] === idx
                                          ? 'bg-purple-600 text-white'
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      }`}
                                      disabled={!poll.active}
                                    >
                                      Vote
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

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
                      <p className="text-sm text-gray-600">{day.highlight} {day.distance ? `- ${day.distance}` : ''}</p>
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
                              value={day.summary ?? ''}
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
                              value={day.activities.join('\n') ?? ''}
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
                              value={day.distance ?? ''}
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
                              value={day.overnight ?? ''}
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
                              value={day.rvNotes ?? ''}
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
                            <p className="text-sm text-gray-600"><strong>Summary:</strong> {day.summary || 'No summary'}</p>
                            <p className="text-sm text-gray-600"><strong>Overnight:</strong> {day.overnight || 'None'}</p>
                            {day.distance && <p className="text-sm text-gray-600"><strong>Distance:</strong> {day.distance}</p>}
                            <p className="text-sm text-gray-600"><strong>Activities:</strong></p>
                            <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
                              {day.activities.map((activity) => (
                                <li key={activity}>{activity}</li>
                              ))}
                            </ul>
                            <p className="text-sm text-gray-600 mt-2"><strong>RV Notes:</strong> {day.rvNotes || 'None'}</p>
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
                              value={day.costs.activities ?? 0}
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
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Accommodations ($)</label>
                            <input
                              type="number"
                              value={day.costs.accommodations ?? 0}
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
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Total Estimated: ${((day.costs.activities || 0) + (day.costs.accommodations || 0)).toFixed(2)}
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

          {currentSection === 'chat' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">☕ Chat with Nanook</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto">
                {conversation.length === 0 ? (
                  <p className="text-gray-500 text-sm">Start chatting with Nanook!</p>
                ) : (
                  conversation.map(msg => (
                    <div
                      key={msg.id}
                      className={`mb-4 p-3 rounded-lg ${
                        msg.type === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100'
                      }`}
                    >
                      <p className="text-sm font-semibold">
                        {msg.type === 'user' ? currentUser : 'Nanook'} •{' '}
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm">{msg.content}</p>
                      {msg.recommendations.length > 0 && (
                        <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
                          {msg.recommendations.map((rec, idx) => (
                            <li key={rec}>{rec}</li>
                          ))}
                        </ul>
                      )}
                      {msg.insider_tip && (
                        <p className="text-xs text-gray-500 mt-1">Insider Tip: {msg.insider_tip}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        {['👍', '😂', '😍'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            className={`text-sm ${msg.reactions.includes(emoji) ? 'text-blue-600' : 'text-gray-500'}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage ?? ''}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                  placeholder="Ask Nanook anything..."
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Send
                </button>
                <button
                  onClick={exportConversation}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Export Chat
                </button>
              </div>
            </div>
          )}

          {currentSection === 'photosManagers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">📸 Photo Challenges</h2>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  Note: Full photo storage coming soon with Google Photos integration. For now, you can add photos as previews (thumbnails saved locally).
                </p>
              </div>
              <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-pink-800">Create New Challenge</h3>
                  <button
                    onClick={() => setShowAddChallenge(!showAddChallenge)}
                    className="px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm"
                  >
                    {showAddChallenge ? 'Cancel' : '+ Add Challenge'}
                  </button>
                </div>
                {showAddChallenge && (
                  <div className="mb-6 p-4 bg-white border border-pink-200 rounded-lg">
                    <h4 className="font-semibold text-pink-700 mb-3">New Photo Challenge</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Challenge description (e.g., Sunset in Tofino)"
                        value={newChallenge.description ?? ''}
                        onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Assign to:</p>
                        <div className="flex flex-wrap gap-2">
                          {friends.map(friend => (
                            <button
                              key={friend}
                              onClick={() =>
                                setNewChallenge(prev => ({
                                  ...prev,
                                  assignedTo: prev.assignedTo.includes(friend)
                                    ? prev.assignedTo.filter(f => f !== friend)
                                    : [...prev.assignedTo, friend]
                                }))
                              }
                              className={`px-3 py-1 text-sm rounded transition-colors ${
                                newChallenge.assignedTo.includes(friend)
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {friend}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={addChallenge}
                        className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                      >
                        Add Challenge
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {photoChallenges.length === 0 ? (
                    <p className="text-gray-500 text-sm">No photo challenges yet. Add one!</p>
                  ) : (
                    photoChallenges.map(challenge => (
                      <div key={challenge.id} className="bg-white p-3 rounded border border-pink-200">
                        <p className="font-medium text-gray-800">{challenge.description}</p>
                        <p className="text-sm text-gray-600">
                          Assigned to: {challenge.assignedTo.join(', ') || 'None'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Completed by: {challenge.completedBy.join(', ') || 'None'}
                        </p>
                        {challenge.thumbnail && (
                          <img
                            src={challenge.thumbnail}
                            alt={challenge.description}
                            className="mt-2 w-24 h-24 object-cover rounded"
                          />
                        )}
                        {challenge.assignedTo.includes(currentUser) && !challenge.completedBy.includes(currentUser) && (
                          <button
                            onClick={() => completeChallenge(challenge.id)}
                            className="mt-2 px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm"
                          >
                            Complete Challenge
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-2">📬 Message Board</h3>
                <div className="space-y-3">
                  {photoBoard.messages.length === 0 ? (
                    <p className="text-gray-500 text-sm">No messages yet.</p>
                  ) : (
                    photoBoard.messages.map(msg => (
                      <div key={msg.id} className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-sm text-gray-600">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex gap-2 mt-1">
                          {['👍', '😂', '😍'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji, true)}
                              className={`text-sm ${msg.reactions.includes(emoji) ? 'text-blue-600' : 'text-gray-500'}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {currentSection === 'map' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">🗺️ Trip Map</h2>
              <MapContainer
                center={[49.2827, -123.1207]}
                zoom={7}
                style={{ height: '400px', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {locations.map(loc => (
                  <Marker key={loc.name} position={[loc.lat, loc.lng]}>
                    <Popup>{loc.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BCRoadTripPlanner;
