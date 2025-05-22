const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load models
const Service = require("./models/Service");
const Setting = require("./models/Setting");
const Gallery = require("./models/Gallery");

// Load env vars
dotenv.config({ path: "./.env" });

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample grooming services
const services = [
  {
    name: "Basic Bath & Brush",
    description:
      "A gentle bath with premium pet shampoo. Perfect for regular maintenance of your pet's coat.",
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
    duration: 15,
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

const galleryMedia = [
  {
    url: "/uploads/1747877314068.jpg",
    type: "image",
    category: "general",
    order: 0,
    isActive: true,
  },
  {
    url: "/uploads/1747877314078.jpg",
    type: "image",
    category: "general",
    order: 1,
    isActive: true,
  },
  {
    url: "/uploads/1747877314079.jpg",
    type: "image",
    category: "general",
    order: 2,
    isActive: true,
  },
  {
    url: "/uploads/1747877314080.jpg",
    type: "image",
    category: "general",
    order: 3,
    isActive: true,
  },
  {
    url: "/uploads/1747877314099.jpg",
    type: "image",
    category: "general",
    order: 5,
    isActive: true,
  },
  {
    url: "/uploads/1747877361045.jpg",
    type: "image",
    category: "general",
    order: 6,
    isActive: true,
  },
  {
    url: "/uploads/1747877030854.mp4",
    type: "video",
    category: "general",
    order: 7,
    isActive: true,
  },
  {
    url: "/uploads/1747878756407.mp4",
    type: "video",
    category: "general",
    order: 8,
    isActive: true,
  },
];

// Sample settings data
const settings = {
  phone: "123-456-7890",
  email: "contact@petpat.com",
  hours: "Mon-Fri 9am-6pm",
  address: "123 Pet Street, Pet City, PC 12345",
  facebook: "https://facebook.com/petpat",
  instagram: "https://instagram.com/petpat",
  wechat: "https://wechat.com/petpat",
};

// Import the sample data into the database
const importData = async () => {
  try {
    // Clear the existing data
    await Service.deleteMany();
    await Setting.deleteMany();
    await Gallery.deleteMany();

    // Insert new data
    await Service.create(services);
    await Setting.create(settings);
    await Gallery.create(galleryMedia);

    console.log("Data Imported!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the import function
importData();
