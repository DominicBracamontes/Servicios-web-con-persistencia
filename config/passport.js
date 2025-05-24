const passport = require('passport');
const passportJWT = require('passport-jwt');
const User = require("../models/User");
const llave = require("./llave");// ←—-En este archivo está la llave con la que se codifica el token
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = llave;
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
let user = User.findById(jwt_payload.id ); // ←—-Aquí verifican el dato codificado en el token
if (user) {
next(null, user); //←- Si el token es válido el requerimiento pasa al
controlador
} else {
next(null, false);//←- Si el token es inválido enviará el “unauthorized”
}
});
passport.use(strategy);
module.exports = passport;