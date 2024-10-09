const express = require('express');
const userRoutes = require('./controllers/userRoutes');
const User = require('./models/User'); // Import the User model
const port = 8001;
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

// Start the express framework
const app = express();

// Use the dependencies
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to all static files
app.use(express.static(path.join(__dirname))); 

app.use('/userapi', userRoutes);

// Connecting to MongoDB
mongoose.connect('mongodb+srv://Rita:Rita@cluster0.rcn7l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
  console.log("DB Connection successful");
})
.catch(() => {
  console.log("Connection Failed!");
});

// Registration route
app.post("/register", (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format. Please enter a valid email.");
  }

  // Check for duplicate email
  User.findOne({ email: email })
      .then(existingUser => {
          if (existingUser) {
              return res.status(400).send("Email already registered. Please use a different email.");
          }

          // Check if passwords match
          if (password !== confirmPassword) {
              return res.status(400).send("Passwords do not match. Try again.");
          }

          // If everything is valid, create a new user
          const newUser = new User({
              name,
              email,
              phone,
              password
          });

          newUser.save()
              .then(() => {
                  console.log("Data successfully inserted");
                  return res.redirect('login.html'); // Redirect after successful registration
              })
              .catch(err => {
                  console.error("Error inserting data:", err);
                  return res.status(500).send("Error inserting data");
              });
      })
      .catch(err => {
          console.error("Error checking for existing user:", err);
          return res.status(500).send("Internal server error");
      });
});
// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                // Redirect with error message
                return res.redirect('/login?error=User not found. Please sign up.');
            }
            if (user.password !== password) {
                return res.redirect('/login?error=Incorrect password. Please try again.');
            }
            // If everything is correct, proceed with login
            return res.send("Login successful!"); // Redirect to a dashboard or home page as needed
        })
        .catch(err => {
            console.error("Error during login:", err);
            return res.redirect('/login?error=Internal server error');
        });
});

// Connecting with the index.html
app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'index.html'));
});
app.get('/register', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'register.html'));
});
app.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'login.html'));
});

// 404 handling
app.use((req, res) => {
    res.status(404).send('<h1>Page not found</h1>');
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});