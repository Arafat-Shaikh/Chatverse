exports.returnUser = (user) => {
  return {
    email: user.email,
    name: user.name,
    picture: user.picture,
    id: user.id,
  };
};
