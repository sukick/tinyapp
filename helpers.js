function generateRandomString(length) {
  let result = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let charLength = char.length;
  for (let i = 0; i < length; i++) {
    result += char.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

function checkEmailExists(email, users) {
  for (let key in users) {
    if ((email === users[key].email)) {
      return key;
    }
  }
};

function urlsForUser(id, urlDatabase) {
  let filteredURLS = {};
  for (let url in urlDatabase) {
    userID = urlDatabase[url]['userID'];
    if (userID === id) {
      filteredURLS[url] = urlDatabase[url];
    }
  } return filteredURLS;
};

module.exports = { generateRandomString,
  checkEmailExists,
  urlsForUser };