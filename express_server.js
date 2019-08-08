const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));


// Helper Functions
function generateRandomString() {
  let randomChar = '';
  let characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let charLength = 6;
  for (let x = 0; x < charLength; x++) {
    let rand = Math.floor(Math.random() * characters.length);
    randomChar += characters.substring(rand, rand + 1);
  }
  return randomChar;
};

const emailLookup = function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
        return true;
    }
  }
  return false;
};

const urlsForUser = function(checkShortURL, database) {
  for (let URL in database) {
    if (URL === checkShortURL) {
      return database[URL].userID;
    }
  }
  return false;
}

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
    urls: urlDatabase, 
    userID: req.cookies["userID"] 
  };
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => {
  // if () {
  //   res.redirect("/login")
  // } else {
  let templateVars = { 
    userID: req.cookies["userID"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_new", templateVars);
  // }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    userID: req.cookies["userID"] 
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
  let templateVars = { userID: req.cookies["userID"] }
  res.render("urls_reg", templateVars);
});

app.get("/login", (req, res) => {
  res.render("urls_login", {user: null});
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});


// LOGIN
app.post("/login", (req, res) => {
  let userID = emailLookup(req.body.email, users);
  if (userID === false) {
    console.log("Email not found");
    res.send("Error 403: Email not found");
  }
  if (userID) {
    for (let key in users) {
      if (users[key].password === req.body.password) {
        console.log("Password is correct");
        res.cookie("userID", newUserID);
        res.redirect("urls");
    } else {
        console.log("Password is incorrect");
        res.send("Error 403: Password incorrect");
      }
    }
  }
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
    users[newUserID] = {id: newUserID, email: req.body.email, password: req.body.password};
    console.log(users[newUserID])
    res.cookie("userID", newUserID);
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
})

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});