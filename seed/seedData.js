const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Worker = require("../models/Worker");
const Service = require("../models/Service");
const Offer = require("../models/Offer");
const Post = require("../models/Post");
const User = require("../models/User");

const connectDB = require("../config/db");

const seedWorkers = [
  {
    name: "Rajesh Sharma",
    profession: "Master Electrician & Smart Home Automation",
    category: "electrician",
    rating: 4.9, reviewsCount: 184, distance: "0.8 km", city: "Lucknow, UP", area: "Alambagh Market",
    isOpen: true, verified: true, experience: "9 Years", workingHours: "08:00 AM - 09:00 PM",
    pricePerHour: "₹399/hr", phone: "+91 98765 43210", email: "rajesh.sharma@localconnect.in",
    image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80",
    about: "Rajesh is a Government Licensed Master Electrician based in Alambagh, Lucknow. He specializes in full house rewiring, inverter installations, smart switch setups, MCB breaker replacements, and 24x7 emergency electrical repairs across Alambagh and Singar Nagar.",
    services: [
      { name: "Smart Home Automation & Switch Setup", price: "₹1,299" },
      { name: "Switchboard & Socket Replacement", price: "₹299" },
      { name: "Inverter Wiring & Connection", price: "₹899" },
      { name: "Ceiling Fan & Heavy Appliance Fitting", price: "₹349" },
    ],
    ratingBreakdown: { 5: 150, 4: 25, 3: 6, 2: 2, 1: 1 },
  },
  {
    name: "Priya Patel",
    profession: "Senior Hair Stylist & Organic Beautician",
    category: "salon",
    rating: 4.8, reviewsCount: 142, distance: "2.5 km", city: "Mumbai, MH", area: "Bandra West",
    isOpen: true, verified: true, experience: "7 Years", workingHours: "09:00 AM - 08:00 PM",
    pricePerHour: "₹599/hr", phone: "+91 98123 45678", email: "priya.patel@localconnect.in",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    about: "Priya is a certified cosmetology expert offering luxury salon and spa experiences at home.",
    services: [
      { name: "O3+ Herbal Facial Treatment", price: "₹1,499" },
      { name: "Hair Cut, Spa & Keratin Blowdry", price: "₹1,899" },
      { name: "Luxury Manicure & Pedicure Spa", price: "₹999" },
      { name: "HD Bridal Makeup Package", price: "₹8,500" },
    ],
    ratingBreakdown: { 5: 115, 4: 20, 3: 4, 2: 2, 1: 1 },
  },
  {
    name: "Amit Kumar",
    profession: "Certified Master Plumber & Leak Specialist",
    category: "plumber",
    rating: 4.7, reviewsCount: 110, distance: "0.8 km", city: "Delhi NCR", area: "Connaught Place",
    isOpen: true, verified: true, experience: "11 Years", workingHours: "07:00 AM - 09:00 PM",
    pricePerHour: "₹349/hr", phone: "+91 97654 32109", email: "amit.kumar@localconnect.in",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=600&q=80",
    about: "Amit has over 11 years of plumbing expertise handling complex pipeline installations.",
    services: [
      { name: "Hydro Drain Cleaning & Unclogging", price: "₹499" },
      { name: "Geyser & Water Heater Fitting", price: "₹699" },
      { name: "Pipeline Leakage Thermal Detection", price: "₹899" },
      { name: "Complete Bathroom Plumbing Upgrade", price: "₹3,500" },
    ],
    ratingBreakdown: { 5: 85, 4: 18, 3: 5, 2: 2, 1: 0 },
  },
  {
    name: "Sunita Devi",
    profession: "Deep Home Cleaning & Sanitization Lead",
    category: "cleaning",
    rating: 4.9, reviewsCount: 215, distance: "3.0 km", city: "Hyderabad, TS", area: "Hitech City",
    isOpen: true, verified: true, experience: "6 Years", workingHours: "08:00 AM - 06:00 PM",
    pricePerHour: "₹450/hr", phone: "+91 99887 76655", email: "sunita.devi@localconnect.in",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&crop=faces&w=600&q=80",
    about: "Sunita leads a team of trained eco-friendly hygiene professionals.",
    services: [
      { name: "Full 2BHK/3BHK Deep Home Cleaning", price: "₹2,999" },
      { name: "Sofa & Carpet Upholstery Shampooing", price: "₹1,199" },
      { name: "Modular Kitchen Deep Degreasing", price: "₹1,499" },
    ],
    ratingBreakdown: { 5: 180, 4: 25, 3: 8, 2: 2, 1: 0 },
  },
  {
    name: "Rohan Verma",
    profession: "Senior Fullstack Web & Mobile Developer",
    category: "webdev",
    rating: 5.0, reviewsCount: 68, distance: "1.8 km", city: "Bengaluru, KA", area: "Koramangala",
    isOpen: true, verified: true, experience: "8 Years", workingHours: "09:00 AM - 07:00 PM",
    pricePerHour: "₹1,200/hr", phone: "+91 96543 21098", email: "rohan.verma@localconnect.in",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&crop=faces&w=600&q=80",
    about: "Rohan builds high-performance web applications, React/Next.js platforms, mobile apps.",
    services: [
      { name: "Custom React / Next.js Business Web App", price: "₹25,000" },
      { name: "E-commerce Store Setup with UPI & Razorpay", price: "₹18,000" },
      { name: "Cross-platform Mobile App (React Native)", price: "₹35,000" },
      { name: "Website Speed & SEO Optimization", price: "₹6,000" },
    ],
    ratingBreakdown: { 5: 65, 4: 3, 3: 0, 2: 0, 1: 0 },
  },
  {
    name: "Dr. Ananya Sen",
    profession: "IIT-JEE & Physics Master Tutor",
    category: "tutors",
    rating: 4.9, reviewsCount: 76, distance: "2.1 km", city: "Kolkata, WB", area: "Salt Lake",
    isOpen: true, verified: true, experience: "10 Years", workingHours: "04:00 PM - 09:00 PM",
    pricePerHour: "₹800/hr", phone: "+91 94321 87654", email: "ananya.sen@localconnect.in",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=600&q=80",
    about: "Dr. Ananya holds a Ph.D. in Physics and mentors high school students for IIT-JEE Advanced.",
    services: [
      { name: "1-on-1 IIT-JEE Physics Coaching", price: "₹800/hr" },
      { name: "NEET Physics Concept Mastery", price: "₹750/hr" },
      { name: "CBSE Class 11 & 12 Board Prep", price: "₹600/hr" },
    ],
    ratingBreakdown: { 5: 70, 4: 5, 3: 1, 2: 0, 1: 0 },
  },
];

const seedServices = [
  { title: "Emergency Electrician & Wiring", category: "electrician", icon: "FiZap", distance: "1.2 km away", area: "Indiranagar 100ft Road", city: "Bengaluru", rating: 4.9, reviewsCount: 184, price: "₹349/visit", description: "Rapid 30-minute response for MCB tripping, short-circuits, inverter connections, and smart switch fitting.", phone: "+91 98765 43210", verified: true, tag: "⚡ Fast Arrival" },
  { title: "Master Plumber & Pipe Leak Repair", category: "plumber", icon: "FiDroplet", distance: "0.8 km away", area: "Indiranagar 12th Main", city: "Bengaluru", rating: 4.8, reviewsCount: 110, price: "₹299/visit", description: "Expert pipe leakage detection, water heater/geyser installation, faucet replacements, and drain unclogging.", phone: "+91 97654 32109", verified: true, tag: "🔧 Licensed Pro" },
  { title: "Split & Window AC Jet Servicing", category: "cleaning", icon: "FiWind", distance: "1.5 km away", area: "Koramangala 4th Block", city: "Bengaluru", rating: 4.9, reviewsCount: 156, price: "₹499/service", description: "Foam jet cleaning, gas charging, filter replacement, and cooling diagnostics for all major AC brands.", phone: "+91 99887 76655", verified: true, tag: "❄️ Cooling Assured" },
  { title: "Full House Deep Cleaning & Sanitization", category: "cleaning", icon: "MdCleaningServices", distance: "2.1 km away", area: "Indiranagar 100ft Road", city: "Bengaluru", rating: 4.9, reviewsCount: 215, price: "₹1,999/flat", description: "3BHK/2BHK deep cleaning, sofa shampooing, modular kitchen degreasing, and anti-bacterial bathroom sanitization.", phone: "+91 98123 45678", verified: true, tag: "✨ Eco Products" },
  { title: "Custom Carpentry & Furniture Repair", category: "carpenter", icon: "FiTool", distance: "1.8 km away", area: "HSR Layout Sector 1", city: "Bengaluru", rating: 4.7, reviewsCount: 94, price: "₹399/hr", description: "Door lock fitting, modular wardrobe fixes, teakwood table polishing, and custom kitchen cabinet repairs.", phone: "+91 96543 21098", verified: true, tag: "🪵 Master Craftsman" },
  { title: "Appliance Repair (TV, Washer, Fridge)", category: "electrician", icon: "FiZap", distance: "2.4 km away", area: "Domlur Layout", city: "Bengaluru", rating: 4.8, reviewsCount: 128, price: "₹399/visit", description: "On-site repair for washing machines, double-door refrigerators, microwave ovens, and Smart LED TVs.", phone: "+91 94321 87654", verified: true, tag: "📺 Doorstep Service" },
  { title: "Express Local Grocery & Fresh Supplies", category: "grocery", icon: "FiShoppingBag", distance: "0.5 km away", area: "MG Road Metro Hub", city: "Bengaluru", rating: 4.9, reviewsCount: 310, price: "Free Delivery", description: "Fresh farm vegetables, dairy, organic grains, and daily household essentials delivered in under 20 mins.", phone: "+91 98765 11223", verified: true, tag: "🚀 20-Min Express" },
  { title: "Nearby Pharmacy & Urgent Medical Care", category: "pharmacy", icon: "FiPlusCircle", distance: "0.9 km away", area: "Indiranagar Double Road", city: "Bengaluru", rating: 4.9, reviewsCount: 240, price: "24x7 Open", description: "24x7 prescription medicines, health diagnostic kits, pulse oximeters, and doorstep emergency medicine delivery.", phone: "+91 98765 99887", verified: true, tag: "🏥 24/7 Active" },
];

const seedOffers = [
  { title: "Monsoon Home Deep Clean Special", discount: "30% OFF", code: "INDIA30", validUntil: "Aug 31, 2026", serviceName: "Full House Deep Sanitization & Eco-Clean", price: "₹1,999", originalPrice: "₹2,850" },
  { title: "Smart Home Automation Saver", discount: "₹500 OFF", code: "SMARTHOME500", validUntil: "Sept 15, 2026", serviceName: "3+ Modular Switch & Inverter Wiring Package", price: "₹1,299", originalPrice: "₹1,799" },
  { title: "Festive Organic Beauty Glow", discount: "20% OFF", code: "FESTIVE20", validUntil: "Aug 25, 2026", serviceName: "O3+ Facial Spa + Luxury Manicure Package", price: "₹1,499", originalPrice: "₹1,899" },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("🌱 Seeding database...");

    // Clear existing data
    await Worker.deleteMany();
    await Service.deleteMany();
    await Offer.deleteMany();
    console.log("🗑️  Cleared existing data");

    // Seed workers
    const workers = await Worker.insertMany(seedWorkers);
    console.log(`✅ Seeded ${workers.length} workers`);

    // Seed services
    const services = await Service.insertMany(seedServices);
    console.log(`✅ Seeded ${services.length} services`);

    // Seed offers
    const offers = await Offer.insertMany(seedOffers);
    console.log(`✅ Seeded ${offers.length} offers`);

    // Create or update demo customer user
    let customerUser = await User.findOne({ email: "customer@localconnect.in" });
    if (!customerUser) {
      await User.create({
        name: "Anshu Kumar",
        email: "customer@localconnect.in",
        password: "demo123456",
        role: "user",
        phone: "+91 98765 12345",
        city: "Lucknow, UP",
        address: "House #45, Sector B, Alambagh, Lucknow, Uttar Pradesh 226005",
      });
      console.log("✅ Created demo customer (customer@localconnect.in / demo123456)");
    } else {
      customerUser.password = "demo123456";
      await customerUser.save();
    }

    // Create a demo user alias if none exists
    const existingUser = await User.findOne({ email: "demo@localconnect.in" });
    if (!existingUser) {
      await User.create({
        name: "Anshu Kumar",
        email: "demo@localconnect.in",
        password: "demo123456",
        role: "user",
        phone: "+91 98765 12345",
        city: "Lucknow, UP",
        address: "House #45, Sector B, Alambagh, Lucknow, Uttar Pradesh 226005",
      });
      console.log("✅ Created demo user (demo@localconnect.in / demo123456)");
    }

    // Create or update Aman Sharma user
    let amanUser = await User.findOne({ email: "amansrh@gmail.com" });
    if (!amanUser) {
      await User.create({
        name: "Aman Sharma",
        email: "amansrh@gmail.com",
        password: "demo123456",
        role: "user",
        phone: "+91 98765 12345",
        city: "Lucknow, UP",
        address: "House #12, Alambagh, Lucknow, Uttar Pradesh 226005",
      });
      console.log("✅ Created user (amansrh@gmail.com / demo123456)");
    } else {
      amanUser.password = "demo123456";
      await amanUser.save();
    }

    // Create or update demo provider
    let existingProvider = await User.findOne({ email: "provider@localconnect.in" });
    if (!existingProvider) {
      await User.create({
        name: "Rajesh Sharma",
        email: "provider@localconnect.in",
        password: "demo123456",
        role: "provider",
        phone: "+91 98765 43210",
        city: "Lucknow, UP",
      });
      console.log("✅ Created demo provider (provider@localconnect.in / demo123456)");
    } else {
      existingProvider.password = "demo123456";
      await existingProvider.save();
    }

    console.log("\n🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDB();
