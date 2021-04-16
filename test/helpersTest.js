const { assert } = require('chai');
const { checkEmailExists } = require('../helpers.js');

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

describe('checkEmailExists', function() {
  it('should return a user with valid email', function() {
    const user = checkEmailExists("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
});

describe('checkEmailExists', function() {
  it('should return undefined for non existent email', function() {
    const user = checkEmailExists("user123@example.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});