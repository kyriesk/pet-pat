# Pet-Pat Grooming Appointment System

A comprehensive web application for managing pet grooming appointments, built with Node.js, Express, MongoDB, and EJS templates.

## Features

- **User Authentication**: Secure registration and login using Passport.js
- **Pet Management**: Add, edit, and manage your pets' profiles
- **Service Catalog**: Browse available grooming services with pricing and details
- **Appointment Booking**: Book appointments for your pets at convenient times
- **Appointment Management**: View, edit, and cancel your appointments
- **Responsive Design**: Mobile-friendly interface using Materialize CSS framework

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML, CSS, Materialize CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with bcrypt for password hashing
- **Templating**: EJS (Embedded JavaScript)
- **Session Management**: express-session with MongoDB store

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Clone the repository:

```
git clone https://github.com/kyriesk/pet-pat.git
cd pet-pat
```

2. Install dependencies:

```
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pet-pat
SESSION_SECRET=your_secret_key
```

4. Seed the database with initial services:

```
npm run seed
```

5. Start the application:

```
npm start
```

For development with automatic restarts:

```
npm run dev
```

6. Access the application at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pet-pat/
├── config/              # Configuration files
│   └── passport.js      # Passport.js authentication config
│   └── paths.js         # Paths.js path config
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
│   └── auth.js          # Authentication middleware
├── models/              # MongoDB models
│   ├── Appointment.js   # Appointment schema
│   ├── Pet.js           # Pet schema
│   ├── Service.js       # Service schema
│   └── User.js          # User schema
├── public/              # Static assets
│   ├── css/             # CSS files
│   ├── js/              # Client-side JavaScript
│   └── img/             # Images
├── routes/              # Express routes
│   ├── appointments.js  # Appointment routes
│   ├── index.js         # Main routes
│   ├── pets.js          # Pet management routes
│   ├── services.js      # Service catalog routes
│   └── users.js         # Authentication routes
├── views/               # EJS templates
│   ├── appointments/    # Appointment views
│   ├── layouts/         # Page layouts
│   ├── partials/        # Reusable components
│   ├── pets/            # Pet management views
│   ├── services/        # Service catalog views
│   └── users/           # Authentication views
├── app.js               # Application entry point
├── package.json         # Project dependencies
├── seed.js              # Database seeding script
├── LICENSE              # Open source license (MIT)
└── .env                 # Environment variables
```


## Future Enhancements

- Admin dashboard for service providers
- Email notifications for booking confirmations and reminders

- Pet health records and grooming history
- Loyalty program for regular customers

## License

This project is licensed under the [MIT License](LICENSE).
