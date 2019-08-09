const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const { generateRandomString, emailLookup, urlsForUser } = require("./helpers");

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
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};



app.get("/urls", (req, res) => {
  let templateVars = { 
    user: users[req.session.user_id],
    urls: urlDatabase, 
  };
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
  let templateVars = { 
    user: req.session.user_id,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
  };
  res.render("urls_show", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
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
  urlDatabase[newURL] = req.body.longURL
  res.redirect(`/urls/${newURL}`);
});

app.get("/register", (req, res) => {
  let templateVars = { user: req.session.user_id }
  res.render("urls_reg", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: req.session.user_id
  }
  res.render("urls_login", templateVars);
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
    res.send("Error 400");
  } else if (emailLookup(req.body.email, users)) {
    console.log('Email exists')
    res.send("Error 400");
  } else {
    let newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID, 
      email: req.body.email, 
      password: bcrypt.hashSync(req.body.password, 10) 
    };
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = `${urlDatabase[req.params.shortURL]}`;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});