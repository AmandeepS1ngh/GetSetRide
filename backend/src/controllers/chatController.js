const { GoogleGenerativeAI } = require("@google/generative-ai");
const Car = require('../models/Car');
const Booking = require('../models/Booking');

// Initialize Gemini
// Ensure GEMINI_API_KEY is in your backend/.env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Define the Tools (Functions the bot can use)
const searchCarsDefinition = {
  name: "search_cars",
  description: "Search for available cars based on location and optional car type.",
  parameters: {
    type: "OBJECT",
    properties: {
      location: { type: "STRING", description: "City or location, e.g., 'Mumbai'" },
      carType: { type: "STRING", description: "Car type, e.g., 'SUV', 'Sedan'" },
    },
    required: ["location"],
  },
};

const bookCarDefinition = {
  name: "book_car",
  description: "Book a car. ALWAYS ask for confirmation before calling this.",
  parameters: {
    type: "OBJECT",
    properties: {
      carName: { type: "STRING", description: "Name of the car to book" },
      startDate: { type: "STRING", description: "Start date (YYYY-MM-DD)" },
      endDate: { type: "STRING", description: "End date (YYYY-MM-DD)" },
    },
    required: ["carName", "startDate", "endDate"],
  },
};

const tools = [
  {
    functionDeclarations: [searchCarsDefinition, bookCarDefinition],
  },
];

// 2. Helper to Execute Functions
async function executeFunction(name, args, userId) {
  console.log(`\n--- EXECUTING TOOL: ${name} ---`);
  console.log("Arguments:", args);

  if (name === "search_cars") {
    try {
      // --- FIX: Query the specific fields found in your DB dump ---
      const query = {
        // Search inside the nested 'location.city' OR 'location.state'
        $or: [
          { 'location.city': new RegExp(args.location, 'i') },
          { 'location.state': new RegExp(args.location, 'i') },
          { 'location.address': new RegExp(args.location, 'i') }
        ],
        // Use 'isActive' instead of 'isAvailable'
        isActive: true 
      };

      // Use 'category' instead of 'type'
      if (args.carType) {
        query.category = new RegExp(args.carType, 'i');
      }
      
      console.log("MongoDB Query:", JSON.stringify(query));

      const cars = await Car.find(query).limit(5);
      
      console.log(`Found ${cars.length} cars.`);

      // --- FIX: Map the DB fields to a clean format for Gemini ---
      // Your DB has 'brand' and 'model', not 'name'.
      const mappedCars = cars.map(car => ({
        name: `${car.brand} ${car.model}`, // Combine brand + model
        price: `₹${car.pricePerDay}/day`,
        category: car.category,
        location: car.location.city,
        seats: car.seats,
        fuel: car.fuelType
      }));

      return mappedCars.length ? mappedCars : "No cars found matching criteria.";
    } catch (err) {
      console.error("Database Error during search:", err);
      return "Error accessing database.";
    }
  }
  
  if (name === "book_car") {
    if (!userId) return "User must be logged in to book.";
    
    try {
      // Search by 'model' or 'brand' since 'name' doesn't exist
      // We try to match the user's string against the model name
      const car = await Car.findOne({ 
        $or: [
          { model: new RegExp(args.carName, 'i') },
          { brand: new RegExp(args.carName, 'i') }
        ]
      });

      if (!car) return "Car not found. Please specify the exact model.";
      
      const booking = await Booking.create({
        user: userId,
        car: car._id,
        startDate: args.startDate,
        endDate: args.endDate,
        totalPrice: car.pricePerDay * 2, // Simplified logic
        status: 'confirmed'
      });
      return `Booking confirmed! ID: ${booking._id}. Enjoy your ${car.brand} ${car.model}.`;
    } catch (err) {
      console.error("Booking Error:", err);
      return "Failed to book car.";
    }
  }
}

exports.handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user ? req.user.id : null;

    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.5-flash",
      tools: tools,
    });

    let chatHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift();
    }

    const chat = model.startChat({
      history: chatHistory,
    });

    let result = await chat.sendMessage(message);
    let response = result.response;
    let text = response.text();

    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0]; 
      const functionResult = await executeFunction(call.name, call.args, userId);

      result = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
            response: { result: functionResult },
          },
        },
      ]);
      
      text = result.response.text();
    }

    res.json({ reply: text });

  } catch (error) {
    console.error("Gemini Controller Error:", error);
    res.status(500).json({ reply: "I'm having trouble connecting right now." });
  }
};