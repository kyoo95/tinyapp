const { assert } = require('chai');

const { emailLookup } = require('../helpers.js');

const testUsers = {
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
};

describe('emailLookup', function() {
  it('should return a user with valid email', function() {
    const user = emailLookup(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return false if there are no valid emails', function() {
    const user = emailLookup(testUsers, "")
    const expectedOutput = false;
    
    assert.equal(user, expectedOutput);
  });
})