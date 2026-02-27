const users = [];

function createUser(user) {
  users.push(user);
  return user;
}

function findByEmail(email) {
  return users.find((user) => user.email === email);
}

function findByIdentifier(identifier) {
  const normalized = String(identifier || "").trim().toLowerCase();
  return users.find(
    (user) => user.email === normalized || (user.username && user.username.toLowerCase() === normalized)
  );
}

module.exports = {
  createUser,
  findByEmail,
  findByIdentifier,
};
