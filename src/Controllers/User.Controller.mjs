const profile = (req, res) => {
  const user = req.decodedUser;
  return res.status(200).json({ Name: "Profile", Users: user });
};

const User_Con = { profile };

export { User_Con };
