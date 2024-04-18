import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "iti os 44", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        return res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    return res.redirect("/login");
  }
};

export { requireAuth };
