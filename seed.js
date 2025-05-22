const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load models
const Service = require("./models/Service");

// Load env vars
dotenv.config({ path: "./.env" });

// Connect to DB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose.connect(MONGO_URI);

// Sample grooming services
const services = [
  {
    name: "Basic Bath & Brush",
    description:
      "A gentle bath with premium pet shampoo, followed by a thorough blow-dry and brush out. Perfect for regular maintenance of your pet's coat.",
    price: 35.0,
    duration: 45,
    petType: ["dog", "cat"],
    image: "/img/service-bath.jpg",
  },
  {
    name: "Full Grooming Package",
    description:
      "Complete grooming service including bath, blow-dry, brush out, haircut styled to your preference or breed standard, nail trim, ear cleaning, and anal gland expression.",
    price: 70.0,
    duration: 90,
    petType: ["dog", "cat"],
    image: "/img/service-haircut.jpg",
  },
  {
    name: "Nail Trim",
    description:
      "Quick and gentle nail trimming to keep your pet's paws comfortable and prevent scratching.",
    price: 15.0,
    duration: 15,
    petType: ["dog", "cat", "rabbit"],
    image: "/img/service-nails.jpg",
  },
  {
    name: "De-shedding Treatment",
    description:
      "Specialized treatment to reduce shedding, removing loose fur from the undercoat while keeping the healthy top coat intact.",
    price: 45.0,
    duration: 60,
    petType: ["dog", "cat"],
    image: "/img/service-deshed.jpg",
  },
  {
    name: "Teeth Brushing",
    description:
      "Gentle cleaning of your pet's teeth with pet-safe toothpaste to promote dental health and fresh breath.",
    price: 12.0,
    duration: 10,
    petType: ["dog", "cat"],
    image: "/img/service-teeth.jpg",
  },
  {
    name: "Flea & Tick Treatment",
    description:
      "Specialized bath and treatment to eliminate fleas and ticks from your pet's coat.",
    price: 40.0,
    duration: 45,
    petType: ["dog", "cat"],
    image: "/img/service-flea.jpg",
  },
];

// Import the sample data into the database
const importData = async () => {
  try {
    // Clear the existing data
    await Service.deleteMany();

    // Insert new data
    await Service.create(services);

    console.log("Data Imported!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the import function
importData();
