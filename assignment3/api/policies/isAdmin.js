// Returns true if the user has the "admin" role.

module.exports = function isAdmin(user) {
  return user?.role === "admin";
};