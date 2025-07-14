
'use client'

import React, { useState, useEffect, useCallback } from 'react';
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
  const [conversation, setConversation] = useState([]); // Added conversation state
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
    // ... other fun facts remain unchanged ...
  ];

  const getRandomFunFact = () => {
    const randomIndex = Math.floor(Math.random() * bcFunFacts.length);
    setCurrentFunFact(bcFunFacts[randomIndex]);
  };

  // Memoized map functions to suppress dependency warnings
  const showMapError = useCallback(() => {
    const mapElement = document.getElementById('trip-map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-100 text-gray-600" role="alert" aria-live="polite">
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
  }, []);

  const createMap = useCallback(() => {
    if (!window.google || !window.google.maps || !document.getElementById('trip-map')) {
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
          content: `<div style="padding: 8px;"><h3 style="margin: 0; color: #1f2937;">Day ${location.day}</h3><p style="margin: 5px 0 0 0; color: #3B82F6;">${location.name
