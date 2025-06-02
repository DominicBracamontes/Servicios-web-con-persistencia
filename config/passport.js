const passport = require('passport');
const passportJWT = require('passport-jwt');
const User = require("../models/User");
const llave = require("./llave");
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = llave;
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
let user = User.findById(jwt_payload.id );
if (user) {
next(null, user);
controlador
} else {
next(null, false);
}
});
passport.use(strategy);
module.exports = passport;