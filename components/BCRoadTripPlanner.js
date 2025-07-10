'use client'

import React, { useState } from 'react';
import { MapPin, Compass, Coffee, Mountain, Waves, Camera, Calendar, Users, Zap, Star } from 'lucide-react';

const BCRoadTripPlanner = () => {
  const [currentSection, setCurrentSection] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const handleClaude = async (prompt) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `You are the ultimate BC road trip guide for 10 guys in their 30s and 40s doing a camper van adventure in July 2026. Be fun, cheeky, and enthusiastic. Focus on outdoor adventures and unexpected places. Here's what they want to know: ${prompt}

Respond with a JSON object:
{
  "response": "Your fun, detailed response",
  "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],
  "insider_tip": "A cheeky insider tip"
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

  const itinerary = [
    { day: 1, location: "Vancouver Start", highlight: "Gear up & get wild", activities: ["Granville Island", "Capilano Suspension Bridge", "Camper van pickup"] },
    { day: 2, location: "Vancouver → Whistler", highlight: "Mountain madness begins", activities: ["Sea-to-Sky Highway", "Shannon Falls", "Whistler Village"] },
    { day: 3, location: "Whistler Adventures", highlight: "Adrenaline overdose", activities: ["Mountain biking", "Ziplining", "Alpine slide"] },
    { day: 4, location: "Whistler → Kamloops", highlight: "Desert vibes", activities: ["Thompson River", "Kamloops Lake", "Sage & desert landscapes"] },
    { day: 5, location: "Kamloops → Revelstoke", highlight: "Railway town chaos", activities: ["Three Valley Gap", "Crazy Creek Suspension Bridge", "Railway Museum"] },
    { day: 6, location: "Revelstoke → Nelson", highlight: "Hippie town takeover", activities: ["Kokanee Glacier", "Lakefront lounging", "Historic downtown"] },
    { day: 7, location: "Nelson → Fernie", highlight: "Rockies entrance", activities: ["Kootenay Lake Ferry", "Mountain views", "Fernie Alpine Resort"] },
    { day: 8, location: "Fernie → Calgary", highlight: "Cowboy territory", activities: ["Crowsnest Pass", "Frank Slide", "Calgary Stampede vibes"] },
    { day: 9, location: "Calgary → Jasper", highlight: "Rockies domination", activities: ["Icefields Parkway", "Athabasca Falls", "Jasper townsite"] },
    { day: 10, location: "Jasper → Vancouver", highlight: "Epic finale", activities: ["Mount Robson", "Kamloops return", "Victory lap"] }
  ];

  const quickQuestions = [
    "What are the most epic outdoor adventures for our group?",
    "Hidden gems and weird roadside attractions we shouldn't miss?",
    "Best camping spots for camper vans along our route?",
    "What should we pack for entertainment during long drives?",
    "Local food challenges and craft breweries to hit?",
    "Emergency backup plans if weather sucks?"
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🏔️ The Ultimate BC Bro-Trip</h2>
        <p className="text-lg">10 legends, 10 days, 1 epic camper van adventure through the most beautiful province in Canada</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <Mountain className="w-8 h-8 text-orange-600 mb-2" />
          <h3 className="font-bold text-orange-800">Outdoor Adventures</h3>
          <p className="text-sm text-orange-700">Mountain biking, hiking, ziplining, and more adrenaline than you can handle</p>
        </div>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <Compass className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-bold text-blue-800">Hidden Gems</h3>
          <p className="text-sm text-blue-700">Weird roadside attractions, secret spots, and places your buddies have never heard of</p>
        </div>
        
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <Users className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-bold text-purple-800">Group Activities</h3>
          <p className="text-sm text-purple-700">Perfect for 10 guys who want to laugh, compete, and create legendary stories</p>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">⚡ Quick Trip Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><strong>Distance:</strong> ~2,500km</div>
          <div><strong>Best Time:</strong> July 2026</div>
          <div><strong>Group Size:</strong> 10 legends</div>
          <div><strong>Vehicle:</strong> Camper vans</div>
        </div>
      </div>
    </div>
  );

  const renderItinerary = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">🗺️ Your 10-Day Adventure Map</h2>
      {itinerary.map((day) => (
        <div 
          key={day.day}
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedDay === day.day 
              ? 'border-blue-500 bg-blue-50 shadow-lg' 
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
                <h3 className="font-bold text-gray-800">{day.location}</h3>
                <p className="text-sm text-gray-600">{day.highlight}</p>
              </div>
            </div>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          
          {selectedDay === day.day && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-semibold mb-2 text-gray-700">Today's Adventures:</h4>
              <div className="grid md:grid-cols-3 gap-2">
                {day.activities.map((activity, idx) => (
                  <div key={idx} className="bg-white rounded px-3 py-2 text-sm border border-gray-200">
                    {activity}
                  </div>
                ))}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaude(`Tell me detailed plans for Day ${day.day} of our BC road trip: ${day.location}. What specific activities should we do? Any hidden gems or unexpected stops? Make it fun and detailed for our group of 10 guys.`);
                }}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Get Detailed Plans for Day {day.day}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderChat = () => (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
      <h2 className="text-xl font-bold mb-2">🤙 Ask Your BC Guide Anything!</h2>
      <p>Got questions about your epic road trip? I've got the insider knowledge to make this trip legendary.</p>
    </div>

    {/* Custom Question Input */}
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
              <span className="font-semibold text-yellow-800">💡 Insider Tip: </span>
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
        <p className="text-gray-600">July 2026 • 10 Days • 10 Legends • Infinite Memories</p>
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
          Ask Guide
        </button>
      </div>

      {currentSection === 'overview' && renderOverview()}
      {currentSection === 'itinerary' && renderItinerary()}
      {currentSection === 'chat' && renderChat()}
    </div>
  );
};

export default BCRoadTripPlanner;
