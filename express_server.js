const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, checkEmailExists, urlsForUser } = require('./helpers.js');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

//Databases/////////////////////////////////////////////////////////
const urlDatabase = {
  vzrUfn: {
    longURL: "http://www.youtube.com",
    userID: "oFXoHP"
  }
};

const users = {
  "OFXoHP": {
    id: "OFXoHP",
    email: "coding@a.com",
    password: "$2b$10$PDGFyPBjk3t4DEAcjSIAtum638A0lG4bM1UDuWIKkbt/v9.obHO22"
  }
};

//MIDDLEWARE////////////////////////////////////////////////////////
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

// GET//////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  // checks if the user is logged in, if not then redirect to login page
  if (!user) {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls');
  return;
});

app.get('/register', (req, res) => {
  // route to register for new users
  const templateVars = {
    user: null,
  };
  res.render('register', templateVars);
});

//login 
app.get('/login', (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render('login', templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  // checks if the user is logged in, if not then redirect to login page
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = {
    user,
  };
  return res.render("urls_new", templateVars);
});

// Fetch and render urls by user
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.send('Please login or register first to access this page.');
  }
  const urls = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls, user };
  return res.render("urls_index", templateVars);
});

// user can only access shortURL page if logged in
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    return res.send('Please log in first to access this page');
  }
  const user = users[req.session.user_id];
  const urls = urlsForUser(user.id, urlDatabase);
  // validates that the user owns the link by checking for a match in their list of urls
  if (Object.keys(urls).includes(shortURL)) {
    const templateVars = { shortURL,
      longURL: urlDatabase[shortURL]['longURL'],
      user: users[req.session.user_id] };
    return res.render("urls_show", templateVars);
  } else {
    return res.send('No access to this page.');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    return res.send('This URL does not exist.');
  }
  return res.redirect(longURL);
});

// if the website is entered incorrectly, redirect to login page
app.get("*", (req, res) => {
  res.redirect('/login');
});

// POST ////////////////////////////////////////////////////////

// Login
app.post("/login", (req, res) => {
  const emailSubmitted = req.body.email;
  const passwordSubmitted = req.body.password;
  const key = checkEmailExists(emailSubmitted, users);
  // if the login name is not found, will display message
  if (!key) {
    return res.status(403).send("This email cannot be found.");
  }
  // if the password is incorrect, will display message 
  bcrypt.compare(passwordSubmitted, users[key].password, (err, result) => {
    if (!result) {
      return res.status(403).send('Password incorrect');
    }
    req.session['user_id'] = key;
    res.redirect('/urls');
  });
});
 
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(6);
  // if the email or password entered is empty, will display message
  if (email === "" || password === "") {
    return res.status(400).send('Please enter an email and password.');
  }
  // if user tries to register with an email that already existed, will display message
  if (checkEmailExists(email, users)) {
    return res.status(400).send("Email has already been taken. Please try with another one!");
  // if the email and user doesnt' exist when registered, will generate an encrypted password and user name
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        const user = {
          id,
          email,
          password: hash
        };
        users[id] = user;
        req.session['user_id'] = user.id;
        res.redirect('/urls');
      });
    });
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = "http://www." +  req.body.longURL;
  const id = req.session['user_id'];
  if (!id) {
    return res.send('Please log in to access this page.');
  }
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

// when user logged out, will redirect to the main page
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

// shortURL can only be deleted if user logged in
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.session['user_id'];
  const shortURL = req.params.shortURL;
  const urlBelongUser = urlDatabase[shortURL].userID;
  if (id === urlBelongUser) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    return;
  }  else {
    res.send('PLease login to access this page.');
  }
});

// user can only shorten URL if logged in 
app.post('/urls/:shortURL', (req, res) => {
  const id = req.session['user_id'];
  if (!id) {
    return res.redirect('/login');
  }
  const user = users[req.session['user_id']];
  const urls = urlsForUser(user.id, urlDatabase);
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;
  if (Object.keys(urls).includes(shortURL)) {
    urlDatabase[req.params.shortURL] =  {
      longURL: "http://www." +  newURL,
      userID: req.session['user_id']
    };
    return res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.send('Please log in to access this page');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});