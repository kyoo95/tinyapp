const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const { generateRandomString, emailLookup, urlsForUser, getURL } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ["bonquiqui"],
}));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));



// Example users and urlDatabase
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "a2@a.com", 
    password: bcrypt.hashSync("123", 10)
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};


app.get("/urls", (req, res) => {
  const filterURLID = getURL(req.session.user_id, urlDatabase);
  let templateVars = { 
    user: users[req.session.user_id],
    urls: filterURLID, 
  };
  console.log(urlDatabase);
  // console.log(users);
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  let templateVars = { 
    user: req.session.user_id,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase)
  console.log(req.params.shortURL)
  if (urlsForUser(req.params.shortURL, urlDatabase)) {
    let templateVars = { 
      user: req.session.user_id,
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL], 
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("No access");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id] && (req.session.user_id)) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    res.redirect("/register");
  } else {
    res.status(401).send("Must log in to edit URL");
  }
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let newURL = generateRandomString();
  urlDatabase[newURL] = {};
  urlDatabase[newURL].longURL = req.body.longURL;
  urlDatabase[newURL].userID = req.session.user_id;
  res.redirect(`/urls/${newURL}`);
});

app.get("/register", (req, res) => {
  res.render("urls_reg", {user: null});
});

app.get("/login", (req, res) => {
  res.render("urls_login", {user: null});
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});


// LOGIN
app.post("/login", (req, res) => {

  const email = req.body.email;
  let userId = emailLookup(email, users)
  if (!userId) {
    console.log("Email not found");
    res.send("Error 403: Email not found");
  } else {
    for (let key in users) {
      if (users[key].email === req.body.email) {
        if (bcrypt.compareSync(req.body.password, users[key].password)) {
          req.session.user_id = key;
          res.redirect("/urls");
        }
      }
    }
  }
});

app.get("register.json", (req, res) => {
  res.json(users);
});

// REGISTRATION 
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    console.log('Empty email/password')  
    res.send("Error 400: No email/password filled in");
  } else if (emailLookup(req.body.email, users)) {
    console.log('Email exists')
    res.send("Error 400: This email already exists");
  } else {
    let newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID, 
      email: req.body.email, 
      password: bcrypt.hashSync(req.body.password, 10) 
    };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = `${urlDatabase[req.params.shortURL]}`;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.newURL
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
