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
        return database[key].id;
    }
  }
  return false;
};

const urlsForUser = function(checkShortURL, database) {
  for (let URL in database) {
    if (URL === checkShortURL) {
      return database[key].id;
    }
  }
  return false;
};

const getURL = function(id, database) {
  const filteredObject = Object.keys(database)
    .filter(key => database[key].userID === id)
    .reduce((obj, key) => {
      obj[key] = database[key];
      return obj;
    }, {});
  return filteredObject;
 };

module.exports = { generateRandomString, emailLookup, urlsForUser, getURL }
