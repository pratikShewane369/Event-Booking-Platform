const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Event = require("../models/Event");

dotenv.config();

const events = [
  {
    title: "TechFusion 2026 — AI & Web Dev Summit",
    description:
      "A full-day conference bringing together developers, AI researchers, and startup founders. Sessions on generative AI, scalable web architecture, and career panels with industry leaders.",
    date: new Date("2026-09-12"),
    location: "World Trade Center, Mumbai",
    category: "Tech",
    availableSeats: 300,
    ticketPrice: 999,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  },
  {
    title: "Rhythm Nation — Live Music Festival",
    description:
      "An open-air concert featuring indie and rock bands from across the country. Food trucks, merch stalls, and a laser light show included.",
    date: new Date("2026-10-05"),
    location: "Mahalaxmi Racecourse, Mumbai",
    category: "Music",
    availableSeats: 1500,
    ticketPrice: 1499,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
  },
  {
    title: "Stand-Up Saturday — Comedy Night",
    description:
      "An evening of stand-up comedy with five rising comedians performing sets on everyday life, relationships, and internet culture.",
    date: new Date("2026-08-16"),
    location: "The Comedy Store, Pune",
    category: "Comedy",
    availableSeats: 120,
    ticketPrice: 499,
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
  },
  {
    title: "City Marathon 2026",
    description:
      "A 10K/21K run through the city's landmarks, open to both amateur and professional runners. Includes hydration stations, medical support, and finisher medals.",
    date: new Date("2026-11-02"),
    location: "Marine Drive, Mumbai",
    category: "Sports",
    availableSeats: 5000,
    ticketPrice: 799,
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&q=80",
  },
  {
    title: "Flavors of India — Food Festival",
    description:
      "A weekend food carnival showcasing regional cuisines from across India, live cooking demos by chefs, and dessert competitions.",
    date: new Date("2026-09-27"),
    location: "Phoenix Marketcity Grounds, Pune",
    category: "Food",
    availableSeats: 800,
    ticketPrice: 299,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
  },
  {
    title: "Canvas & Color — Contemporary Art Exhibition",
    description:
      "A curated exhibition featuring works from emerging contemporary artists, with an opening night gallery walk and artist Q&A session.",
    date: new Date("2026-08-30"),
    location: "Jehangir Art Gallery, Mumbai",
    category: "Art",
    availableSeats: 200,
    ticketPrice: 199,
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80",
  },
  {
    title: "Startup Pitch Night",
    description:
      "Early-stage founders pitch to a panel of investors and mentors. Networking session follows with refreshments and 1:1 investor meetups.",
    date: new Date("2026-09-20"),
    location: "T-Hub, Hyderabad",
    category: "Business",
    availableSeats: 150,
    ticketPrice: 0,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
  },
  {
    title: "Yoga & Wellness Retreat — Day Pass",
    description:
      "A day of guided yoga sessions, meditation workshops, and nutrition talks led by certified wellness instructors, set in a serene outdoor venue.",
    date: new Date("2026-10-18"),
    location: "Lonavala Retreat Center, Maharashtra",
    category: "Wellness",
    availableSeats: 100,
    ticketPrice: 599,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
  },
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    // Optional: wipe existing events before reseeding
    // await Event.deleteMany();

    const inserted = await Event.insertMany(events);
    console.log(`${inserted.length} events inserted successfully`);
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedEvents();