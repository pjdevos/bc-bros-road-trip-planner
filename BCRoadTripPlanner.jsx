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
  const [isOnline, setIsOnline] = useState(true);
  const [weatherData, setWeatherData] = useState({});
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [showWeatherDetails, setShowWeatherDetails] = useState({});
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showDaySummary, setShowDaySummary] = useState({});
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [showAddChallenge, setShowAddChallenge] = useState(false);

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

  const [editableItinerary, setEditableItinerary] = useState(
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
      title: "BC Has Its Own Time Zone... Sort Of",
      fact: "Most of BC is on Pacific Time, but a tiny chunk in the northeast runs on Mountain Time. It's like BC couldn't decide what time zone it wanted to be in, so it said 'why not both?'",
      tip: "🕐 Don't be late for dinner in Fort St. John — you might be in the wrong time zone."
    },
    {
      title: "Tim Hortons vs. Local Coffee Wars",
      fact: "BC has the most intense coffee shop loyalty in Canada. You're either a 'Timmies' person or a 'local roastery' person. There is no middle ground, and friendships have ended over it.",
      tip: "☕ Saying 'double-double' at a craft coffee shop will get you the stink eye of a lifetime."
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
    },
    {
      title: "Surrey Has the World's Longest Beard",
      fact: "BC resident Sarwan Singh holds the world record for 'Longest Beard' at over 2.33 metres. That's longer than most people are tall, and definitely longer than your attention span.",
      tip: "🧔 Don't ask him for beard care tips unless you have 3 hours to spare."
    },
    {
      title: "Pamela Anderson Was Canada's Birthday Baby",
      fact: "Pamela Anderson was born in Ladysmith, BC at 4:08 AM on July 1st, 1967 — making her Canada's official 'Centennial Baby' for the 100th Canada Day celebration.",
      tip: "🎂 Peak Canadian timing: being born exactly on Canada's birthday."
    },
    {
      title: "BC Once Banned Alcohol (It Didn't Go Well)",
      fact: "Between 1917 and 1921, BC tried prohibition. Spoiler alert: it lasted about as long as a snowball in a Kelowna vineyard.",
      tip: "🍻 Good thing they figured out wine country was a better idea."
    },
    {
      title: "Nanaimo: Bathtub Racing Capital of the World",
      fact: "Since 1967, Nanaimo has hosted the World Championship Bathtub Race. Yes, people race actual bathtubs across the ocean. No, nobody questions this.",
      tip: "🛁 Peak BC: turning bathroom fixtures into competitive water sports."
    },
    {
      title: "BC Is Ridiculously Huge",
      fact: "At just under 950,000 square kilometers, BC is bigger than France, Italy, Ukraine, and Japan. It's the 4th largest province/state in North America after Alaska, Quebec, and Texas.",
      tip: "📏 When locals say 'it's just down the road,' they might mean 8 hours of driving."
    },
    {
      title: "Vancouver Has a Nightly Cannon Ritual",
      fact: "Every night at 9pm sharp, a cannon fires in Vancouver aimed at downtown. It's been happening for over 150 years, and somehow people still jump.",
      tip: "💥 Don't worry, it's just Vancouver saying goodnight. Very loudly."
    },
    {
      title: "The Famous Steam Clock Isn't Actually Steam-Powered",
      fact: "Vancouver's famous Gastown Steam Clock? It's mostly electric. The 'steam' is just for show. Peak tourist trap energy.",
      tip: "⏰ Don't tell the Instagram influencers — they're having too much fun posing with 'authentic Victorian steam technology.'"
    },
    {
      title: "SkyTrain Drives Itself",
      fact: "Vancouver's SkyTrain has no driver or pilot — it's fully automated. The trains just... know where to go. Very BC: even public transit is chill and independent.",
      tip: "🚇 Don't panic if you don't see a driver. The robots have it handled."
    },
    {
      title: "California Roll? More Like Vancouver Roll",
      fact: "Some say the California Roll was actually invented in Vancouver. California just had better marketing. Classic BC: inventing things and letting other places take credit.",
      tip: "🍣 Yet another reason to side-eye California at wine tastings."
    },
    {
      title: "Legendary Creatures Have Legal Protection",
      fact: "Ogopogo, Sasquatch/Bigfoot, and other legendary creatures are legally protected as 'endangered species' in BC — just in case they're real. Only in BC would mythical beings get government paperwork.",
      tip: "🦶 If you see Bigfoot, don't disturb him. He's got legal rights and probably better healthcare than you."
    },
    {
      title: "BC Loves Weird World Records",
      fact: "Victoria resident Josiah Plett holds the record for solving Rubik's cubes while hula-hooping (531 one-handed!). Meanwhile, 320 people in Chetwynd painted blindfolded simultaneously. Peak BC energy.",
      tip: "🏆 In BC, if it's weird and nobody's tried it yet, someone will make it a world record."
    },
    {
      title: "Bears Know Traffic Rules",
      fact: "BC has around 120,000-160,000 black bears, and they've learned that highways provide easy travel routes. Some bears have been spotted 'hitchhiking' by following cars on mountain roads!",
      tip: "🐻 Always keep food locked up when camping, and yes, that includes toothpaste!"
    },
    {
      title: "World's Longest Coastline Secret",
      fact: "BC's coastline is so complex and fjord-filled that if you straightened it out, it would stretch for over 25,000 kilometers - longer than the distance around the entire Earth!",
      tip: "🌊 This means endless hidden coves and secret beaches to discover."
    },
    {
      title: "The Ultimate Weather Forecast",
      fact: "If you can see the mountains, it's going to rain. If you can't see the mountains, it's already raining. This is the only weather forecast you need in BC.",
      tip: "🌧️ Forget the weather app. Just look at the mountains and pack accordingly."
    }
  ];

  const getRandomFunFact = () => {
    const randomIndex = Math.floor(Math.random() * bcFunFacts.length);
    setCurrentFunFact(bcFunFacts[randomIndex]);
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

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🚐 BC Bros Road Trip</h1>
            <p className="text-gray-600">Markus's Epic 40th Birthday Adventure</p>
            <p className="text-sm text-gray-500 mt-2">July 2026 • 10 International Legends</p>
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
                      placeholder="Description (e.g., Gas, Food, etc.)"
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
                    <input
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, paidBy: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded"
                      placeholder={`${currentUser} (you) or someone else...`}
                    />
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
                    <p className="text-xs text-gray-500 mt-1">
                      Split {newExpense.splitBetween.length} ways = ${newExpense.amount && !isNaN(parseFloat(newExpense.amount)) ? (parseFloat(newExpense.amount) / newExpense.splitBetween.length).toFixed(2) : '0.00'} each
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addExpense}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Add Expense
                    </button>
                    <button
                      type="button"
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
              <h4 className="font-semibold text-yellow-700 mb-3">Who Owes What:</h4>
              
              {(() => {
                const debts = getDebts();
                const balances = calculateBalances();
                const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                
                return (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <strong>Total Expenses:</strong> ${totalExpenses.toFixed(2)}
                    </div>

                    {debts.length === 0 ? (
                      <p className="text-green-600 font-medium">🎉 Everyone's even! No debts to settle.</p>
                    ) : (
                      <div className="space-y-2">
                        {debts.map((debt, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                            <span className="text-sm">
                              <strong>{debt.from}</strong> owes <strong>{debt.to}</strong>
                            </span>
                            <span className="font-bold text-red-600">${debt.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <button
                        type="button"
                        onClick={() => setShowBudgetBreakdown(!showBudgetBreakdown)}
                        className="flex items-center gap-2 text-yellow-700 font-semibold hover:text-yellow-800"
                      >
                        {showBudgetBreakdown ? '▲' : '▼'} Individual Balances
                      </button>
                      {showBudgetBreakdown && (
                        <div className="mt-2 grid md:grid-cols-2 gap-2">
                          {Object.entries(balances).map(([person, balance]) => (
                            <div key={person} className={`p-2 rounded text-sm ${
                              Math.abs(balance) < 0.01 ? 'bg-gray-100 text-gray-600' :
                              balance > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              <strong>{person}:</strong> ${balance.toFixed(2)}
                              {balance > 0.01 && ' (to receive)'}
                              {balance < -0.01 && ' (to pay)'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

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
                      <p className="text-xs">Current: 22°C, Sunny</p>
                      <p className="mt-1 text-xs font-semibold">5-Day Forecast:</p>
                      <ul className="text-xs list-disc pl-3">
                        <li>Jul 15: 24°C, Sunny</li>
                        <li>Jul 16: 26°C, Partly Cloudy</li>
                        <li>Jul 17: 23°C, Rain</li>
                        <li>Jul 18: 25°C, Sunny</li>
                        <li>Jul 19: 27°C, Sunny</li>
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-purple-800">🗳️ Group Polls</h3>
              <button
                type="button"
                onClick={() => setShowCreatePoll(!showCreatePoll)}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                {showCreatePoll ? 'Cancel' : '+ New Poll'}
              </button>
            </div>

            {showCreatePoll && (
              <div className="mb-6 p-4 bg-white border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-700 mb-3">Create New Poll</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Poll question..."
                    value={newPoll.question}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  ))}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={createPoll}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Create Poll
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreatePoll(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {polls.map(poll => {
                const totalVotes = Object.keys(poll.votes).length;
                const voteCounts = poll.options.map((_, idx) => 
                  Object.values(poll.votes).filter(vote => vote === idx).length
                );

                return (
                  <div key={poll.id} className={`p-4 rounded-lg border-2 ${poll.active ? 'bg-white border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-800">{poll.question}</h4>
                      {poll.active && (
                        <button
                          type="button"
                          onClick={() => closePoll(poll.id)}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Close Poll
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {poll.options.map((option, optionIndex) => {
                        const voteCount = voteCounts[optionIndex];
                        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                        
                        return (
                          <div key={optionIndex} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">{option}</span>
                              <span className="text-sm text-gray-500">{voteCount}/{totalVotes} votes ({percentage}%)</span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>

                            {poll.active && (
                              <div className="flex gap-1 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleVote(poll.id, optionIndex)}
                                  className={`text-sm px-3 py-1 rounded transition-colors ${
                                    currentUser && poll.votes[currentUser] === optionIndex
                                      ? 'bg-purple-600 text-white font-bold'
                                      : currentUser && poll.votes[currentUser] !== undefined
                                        ? 'bg-gray-200 text-gray-500'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  }`}
                                  disabled={!poll.active}
                                >
                                  {currentUser && poll.votes[currentUser] === optionIndex ? '✓ Your Vote' : 'Vote for This'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        <strong>Voted:</strong> {Object.keys(poll.votes).join(', ') || 'No votes yet'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <strong>Pending:</strong> {friends.filter(friend => !(friend in poll.votes)).join(', ') || 'Everyone voted!'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
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
                  type="button"
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
                  type="button"
                  onClick={getRandomFunFact}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
                >
                  🎲 Another Fun Fact!
                </button>
              </div>
            </div>
          )}

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
                  <li>• <strong>No cell service?</strong> Many BC areas have spotty coverage - plan accordingly</li>
                  <li>• <strong>Weather changes fast:</strong> Always carry emergency supplies in your RV</li>
                  <li>• <strong>Ferry delays:</strong> Check BC Ferries app for real-time updates</li>
                  <li>• <strong>Wildlife encounters:</strong> Never approach bears - make noise, back away slowly</li>
                  <li>• <strong>Medical:</strong> Nearest hospitals may be hours away in remote areas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4">
            <h3 className="font-bold text-pink-800 mb-4">📸 Photo Challenges & Message Board</h3>
            
            <div className="space-y-6">
              <div className="bg-white p-4 rounded border border-pink-200">
                <h4 className="font-semibold text-pink-700 mb-3">📱 Photo Sharing Setup</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Shared Album Link:</label>
                    <input
                      type="url"
                      value={photoBoard.sharedAlbumLink}
                      onChange={(e) => setPhotoBoard(prev => ({ ...prev, sharedAlbumLink: e.target.value }))}
                      placeholder="https://photos.google.com/share/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Instagram Hashtag:</label>
                    <input
                      type="text"
                      value={photoBoard.instagramHashtag}
                      onChange={(e) => setPhotoBoard(prev => ({ ...prev, instagramHashtag: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-pink-700">🎯 Photo Challenges</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddChallenge(!showAddChallenge)}
                    className="px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm"
                  >
                    {showAddChallenge ? 'Cancel' : '+ Add Challenge'}
                  </button>
                </div>

                {showAddChallenge && (
                  <div className="mb-4 p-3 bg-white border border-pink-200 rounded">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChallenge}
                        onChange={(e) => setNewChallenge(e.target.value)}
                        placeholder="New photo challenge..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={addPhotoChallenge}
                        className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {photoBoard.challenges.map(challenge => (
                    <div key={challenge.id} className={`p-4 rounded border-2 ${
                      challenge.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-pink-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className={`font-medium ${challenge.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                          {challenge.challenge}
                        </p>
                        {challenge.completed && (
                          <span className="text-green-600 font-bold text-sm">✓ DONE!</span>
                        )}
                      </div>

                      {challenge.completed ? (
                        <div className="text-sm text-green-700">
                          <strong>Completed by:</strong> {challenge.completedBy}
                          {challenge.proof && (
                            <div className="mt-1">
                              <strong>Proof:</strong> {challenge.proof}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className="text-sm text-gray-600">
                            {challenge.assignedTo ? (
                              <span><strong>Assigned to:</strong> {challenge.assignedTo}</span>
                            ) : (
                              <span className="text-gray-500">Not assigned yet</span>
                            )}
                          </div>
                          
                          <div className="flex gap-1 flex-wrap">
                            {friends.map(friend => (
                              <button
                                key={friend}
                                type="button"
                                onClick={() => assignChallenge(challenge.id, friend)}
                                className={`text-xs px-2 py-1 rounded transition-colors ${
                                  challenge.assignedTo === friend
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                                }`}
                              >
                                {friend}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const completedBy = prompt('Who completed this challenge?', challenge.assignedTo);
                              if (completedBy) {
                                const proof = prompt('Any proof/description? (optional)');
                                completeChallenge(challenge.id, completedBy, proof || '');
                              }
                            }}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-pink-700 mb-3">💬 Message Board</h4>
                
                <div className="bg-white border border-pink-200 rounded-lg">
                  <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                    {photoBoard.messages.map(message => (
                      <div key={message.id} className={`p-3 rounded ${
                        message.author === 'App' ? 'bg-pink-100' : 'bg-gray-100'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-gray-800">{message.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{message.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-pink-200 p-4">
                    <form onSubmit={addMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Share an update, spotted Bigfoot, found the best poutine..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                      >
                        Post
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-pink-200">
                <h4 className="font-semibold text-pink-700 mb-2">🏆 Challenge Progress</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm"><strong>Total Challenges:</strong> {photoBoard.challenges.length}</p>
                    <p className="text-sm"><strong>Completed:</strong> {photoBoard.challenges.filter(c => c.completed).length}</p>
                  </div>
                  <div>
                    <p className="text-sm"><strong>Top Challenger:</strong> 
                      {(() => {
                        const completions = {};
                        photoBoard.challenges.forEach(c => {
                          if (c.completed && c.completedBy) {
                            completions[c.completedBy] = (completions[c.completedBy] || 0) + 1;
                          }
                        });
                        const top = Object.entries(completions).sort((a, b) => b[1] - a[1])[0];
                        return top ? ` ${top[0]} (${top[1]})` : ' Nobody yet!';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentSection === 'itinerary' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">🗺️ Your 10-Day Adventure Map</h2>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              🗺️ {showMap ? 'Hide Map' : 'Show Route Map'}
            </button>
          </div>

          {showMap && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-t-xl p-4 text-white">
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
              <div className="w-full h-96 rounded-b-xl border border-gray-200 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-lg font-semibold mb-2 text-gray-700">🗺️ Interactive BC Route Map</p>
                  <p className="text-sm text-gray-600 mb-4">Your epic journey visualization</p>
                  <div className="text-left bg-white rounded-lg p-4 shadow-sm max-w-sm mx-auto">
                    <div className="text-xs space-y-1 text-gray-700">
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
            </div>
          )}

          {defaultItinerary.map((day, dayIndex) => (
            <div
              key={day.day}
              className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                selectedDay === day.day
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{day.location}</h3>
                    <p className="text-sm text-gray-600">{day.highlight}</p>
                  </div>
                </div>
                <span className="text-gray-400">📍</span>
              </div>

              {selectedDay === day.day && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">Today's Adventures:</h4>
                  </div>

                  <div className="grid md:grid-cols-3 gap-2">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="bg-white rounded px-3 py-2 text-sm border border-gray-200">
                        {activity}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDaySummary(prev => ({
                          ...prev,
                          [day.day]: !prev[day.day]
                        }));
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      {showDaySummary[day.day] ? 'Hide Day Summary' : `Get Day ${day.day} Summary`}
                    </button>
                    
                    {showDaySummary[day.day] && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 leading-relaxed">{day.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentSection === 'chat' && (
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
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Type your question (e.g., @Tom, book the ferry?)..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => {
                  if (customQuestion.trim()) {
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

          <div className="text-center text-gray-500 py-8">
            <p>👋 Hey {currentUser}! The chat feature is coming soon - Nanook is getting ready to help you plan your epic BC adventure!</p>
            <p className="text-sm mt-2">For now, use the overview and itinerary sections to explore your trip.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BCRoadTripPlanner;