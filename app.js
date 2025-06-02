require('dotenv').config();

const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const fs = require("fs");
const https = require("https");
require("dotenv").config();
const forceSSL = require("express-sslify");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = express();
app.use(
  cors({
    origin: true, 
    credentials: true
  })
);
app.use(cookieParser());
app.use(forceSSL.HTTPS());

const port = process.env.PORT || 3000;
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

// SSL Options
const options = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem"),
};

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const FRONTEND_URL = process.env.FRONTEND_URL || "https://localhost:5173";

function generateXsrfToken(jwtToken) {
  return crypto.createHmac("sha256", process.env.SECRET_KEY)
    .update(jwtToken)
    .digest("hex");
}

function generateToken(user) {
  return jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1h' });
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login?error=google` }),
  (req, res) => {
    const user = {
      id: req.user.id,
      name: req.user.displayName,
      email: req.user.emails[0].value,
    };

    const token = generateToken(user);
    const xsrfToken = generateXsrfToken(token);

    console.log('=== TOKENS GENERADOS (GOOGLE) ===');
    console.log('JWT:', token);
    console.log('XSRF:', xsrfToken);
    console.log('Payload:', jwt.decode(token));
    console.log('==============================');

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: "/",
      maxAge: 900000, // 15 minutos
    });

    res.cookie("XSRF-TOKEN", xsrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: "Strict",
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: "/",
      maxAge: 900000, // 15 minutos
    });

    res.redirect(`${FRONTEND_URL}/home`);
  }
);

function validateAuth(req, res, next) {
  const token = req.cookies.auth_token;
  const xsrfToken = req.cookies['XSRF-TOKEN'] || req.headers['x-xsrf-token'];

  if (!token || !xsrfToken) {
    return res.status(401).json({ error: 'Tokens faltantes' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const expectedXsrf = generateXsrfToken(token);
    
    if (xsrfToken !== expectedXsrf) {
      return res.status(401).json({ error: 'Token XSRF inválido' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

app.get("/login", (req, res) => {
  res.send(`
    <form>
      <button type="button" onclick="window.location.href='/auth/google'">
        Authenticate with Google
      </button>
    </form>
  `);
});

// Logout route
app.get("/logout", (req, res) => {
  console.log("Logout");
  res.clearCookie("auth_token");
  res.clearCookie("XSRF-TOKEN");
  res.status(200).redirect(`/login`);
});

app.get("/api/protected", validateAuth, (req, res) => {
  const token = req.cookies.auth_token;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.json({ data: "Información sensible", user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
});

app.get("/user/profile", validateAuth, (req, res) => {
  const token = req.cookies.auth_token;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("USUARIO:", decoded);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
});

app.get("/", (req, res) => {
  res.send("Hola Mundo!");
});

app.get("/dashboard", (req, res) => {
  console.log("Cookie: auth_token\n", req.cookies.auth_token);
  console.log("Cookie: XSRF-TOKEN\n", req.cookies["XSRF-TOKEN"]);
  res.status(200).send({ message: "Hello World!" });
});

https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});

app.use(cors({
  origin: ['https://localhost:5173', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const estudianteRouter = require('./routes/estudianteindex');
const personaRoutes = require('./routes/personaindex');
const docenteRoutes = require('./routes/docenteindex');
const asignaturaRoutes = require('./routes/asignaturaindex');
const categoriaEmpleadoRoutes = require('./routes/categoriaEmpleadoindex');
const contratoRoutes = require('./routes/contratoindex');
const inscripcionesRoutes = require('./routes/inscripcionindex');
const usuariosRoutes = require('./routes/usuarioindex');

app.use('/estudiantes', estudianteRouter);
app.use('/personas', personaRoutes);
app.use('/docentes', docenteRoutes);
app.use('/asignaturas', asignaturaRoutes);
app.use('/categoriaEmpleados', categoriaEmpleadoRoutes);
app.use('/contratos', contratoRoutes);
app.use('/inscripciones', inscripcionesRoutes);
app.use('/usuarios', usuariosRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});
