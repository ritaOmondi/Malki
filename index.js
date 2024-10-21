const express = require('express');
const userRoutes = require('./controllers/userRoutes');
const User = require('./models/User'); // Import the User model
const Entry = require('./models/Entry'); // Import Entry model
const Profile = require('./models/People'); // Import Profile model
const port = 8001;
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer'); // For file upload

// Start the Express framework
const app = express();

// Use the dependencies/middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve static files from uploads directory

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

// Registration and login forms
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
                return res.redirect('/login?error=User not found. Please sign up.');
            }
            if (user.password !== password) {
                return res.redirect('/login?error=Incorrect password. Please try again.');
            }
            return res.redirect('/user.html'); // Change this line
        })
        .catch(err => {
            console.error("Error during login:", err);
            return res.redirect('/login?error=Internal server error');
        });
});

// ROUTES
app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'index.html'));
});
app.get('/register', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'register.html'));
});
app.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'login.html'));
});
app.get('/user', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'user.html'));
});
app.get('/addEntry', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'addEntry.html'));
});
app.get('/addProfile', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'addProfile.html'));
});
app.get('/profile', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'profile.html'));
});

// Route to handle entry form submission
app.post('/add-entry', (req, res) => {
    const { name, age, diagnosis, location, county } = req.body;

    const newEntry = new Entry({
        name,
        age,
        diagnosis,
        location,
        county
    });

    newEntry.save()
        .then(() => {
            console.log("Entry successfully added");
            return res.redirect('/user.html'); // Redirect back to the user page after adding
        })
        .catch(err => {
            console.error("Error adding entry:", err);
            return res.status(500).send("Error adding entry");
        });
});

// Route to fetch all entries
app.get('/api/entries', (req, res) => {
    Entry.find()
        .then(entries => {
            res.json(entries); // Send entries as JSON
        })
        .catch(err => {
            console.error("Error fetching entries:", err);
            res.status(500).send("Error fetching entries");
        });
});
//updating entries

app.put('/update-entry/:id', (req, res) => {
    Entry.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(updatedEntry => res.json(updatedEntry))
        .catch(err => res.status(400).send('Error updating entry: ' + err));
});
// deleting entries
app.delete('/delete-entry/:id', (req, res) => {
    Entry.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send())
        .catch(err => res.status(400).send('Error deleting entry: ' + err));
});


// Route to fetch all profiles
app.get('/api/profiles', (req, res) => {
    Profile.find()
        .then(profiles => {
            res.json(profiles); // Send profiles as JSON
        })
        .catch(err => {
            console.error("Error fetching profiles:", err);
            res.status(500).send("Error fetching profiles");
        });
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage: storage });

// Route to handle profile form submission
app.post('/profile', upload.single('photo'), (req, res) => {
    const { name, father, mother, diagnosis, gender, age, notes, treat } = req.body;
    const photo = req.file ? req.file.path : null; // Handle optional photo

    const newProfile = new Profile({
        name,
        father,
        mother,
        diagnosis,
        gender,
        age,
        notes,
        treat,
        photo // Include the photo field
    });

    newProfile.save()
        .then(profile => {
            console.log("Profile successfully added");
            return res.redirect(`/profile/${profile._id}`); // Redirect to the new profile page
        })
        .catch(err => {
            console.error("Error adding profile:", err);
            return res.status(500).send("Error adding profile");
        });
});

// Route to fetch profile by ID
app.get('/profile/:id', (req, res) => {
    Profile.findById(req.params.id)
        .then(profile => {
            if (!profile) {
                return res.status(404).send("Profile not found");
            }
            res.status(200).json(profile); // Send profile as JSON
        })
        .catch(err => {
            console.error("Error fetching profile:", err);
            res.status(500).send("Error fetching profile");
        });
});
// Route to fetch all entries and render in user.html
app.get('/user', (req, res) => {
    Entry.find()
        .then(entries => {
            res.render('user.html', { entries }); // Pass entries to the template
        })
        .catch(err => {
            console.error("Error fetching entries:", err);
            res.status(500).send("Error fetching entries");
        });
});

// 404 handling page
app.use((req, res) => {
    res.status(404).send('<h1>Page not found</h1>');
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});