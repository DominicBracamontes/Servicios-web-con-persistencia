
// const express = require('express');
// const https = require('https');
// const fs = require('fs');
// const cors = require('cors');
// const app = express();

// const options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem'),
//   minVersion: 'TLSv1.2' 
// };

// const server = https.createServer(options, app);

// app.use(cors({
//   origin: ['https://localhost:5173', 'http://localhost:5173'], 
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const estudianteRouter = require('./routes/estudianteindex');
// const personaRoutes = require('./routes/personaindex');
// const docenteRoutes = require('./routes/docenteindex');
// const asignaturaRoutes = require('./routes/asignaturaindex');
// const categoriaEmpleadoRoutes = require('./routes/categoriaEmpleadoindex');
// const contratoRoutes = require('./routes/contratoindex');
// const inscripcionesRoutes = require('./routes/inscripcionindex');

// app.use('/estudiantes', estudianteRouter);
// app.use('/personas', personaRoutes);
// app.use('/docentes', docenteRoutes);
// app.use('/asignaturas', asignaturaRoutes);
// app.use('/categoriaEmpleados', categoriaEmpleadoRoutes);
// app.use('/contratos', contratoRoutes);
// app.use('/inscripciones', inscripcionesRoutes);

// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'OK' });
// });

// app.use((req, res, next) => {
//   res.status(404).json({ error: 'Ruta no encontrada' });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Error interno del servidor' });
// });

// const PORT = 3000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(` Servidor HTTPS corriendo en https://localhost:${PORT}`);

// });

// process.on('SIGINT', () => {
//   server.close(() => {
//     console.log('\n Servidor cerrado correctamente');
//     process.exit(0);
//   });
// });


/////////////////////////////////////////////////////////////////////////////////////////////
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

const FRONTEND_URL = "https://localhost:5173";

function generateXsrfToken(jwtToken) {
  const xsrfToken = crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(JSON.stringify(jwtToken))
    .digest("hex");
  return xsrfToken;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      // Aquí puedes guardar el perfil del usuario en tu base de datos
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
  passport.authenticate("google", { scope: ["profile", "email"] })
  
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `/error` }),
  (req, res) => {
    
    const user = {
      id: req.user.id,
      name: req.user.displayName,
      email: req.user.emails[0].value,
      
    }
    // En tu método de login con Google
localStorage.setItem('correoUsuario', emailGoogle);
    const token = jwt.sign(user, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log("AUTH TOKEN GENERADO:", token);
    const xsrfToken = generateXsrfToken(token);

    res.cookie("auth_token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "Strict",
      domain: "localhost",
      path: "/",
      maxAge: 900000, // 15 minutos
    });
    res.cookie("XSRF-TOKEN", xsrfToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      domain: "localhost",
      path: "/",
      maxAge: 900000, // 15 minutos
    });
    res.redirect(`https://localhost:5173/home`);
  }
);

function validateAuth(req, res, next) {
  const auth_token = req.cookies["auth_token"];
  const xsrfToken = req.cookies["XSRF-TOKEN"];
  const authAuthToken = req.headers["authorization"];

  console.log("auth_token", auth_token);
  console.log("xsrfToken", xsrfToken);
  console.log("authAuthToken", authAuthToken);
  if (
    !auth_token ||
    !xsrfToken ||
    // !authAuthToken ||  descomentar cuando se use con un frontend real que envíe el token en el header
    generateXsrfToken(auth_token) !== xsrfToken
  ) {
    res.status(401).send("Not Authorized");
    return;
  }
  next();
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

// Antes de regresar los datos valida que la llamada tenga las
// cookies y headers adecuados con validateAuth
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

/////////////////////////////////////////////////////////////////////////////////////////////

// require('dotenv').config();

// const express = require("express");
// const session = require("express-session");
// const fs = require("fs");
// const https = require("https");
// const forceSSL = require("express-sslify");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const { OAuth2Client } = require("google-auth-library");

// // Configuración
// const app = express();
// const port = process.env.PORT || 3000;
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const FRONTEND_URL = "https://localhost:5173";

// // Middlewares
// app.use(cors({
//   origin: FRONTEND_URL,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-XSRF-TOKEN"]
// }));
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(forceSSL.HTTPS());
// app.use(session({
//   secret: process.env.SECRET_KEY,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: true }
// }));

// // SSL
// const options = {
//   key: fs.readFileSync("./key.pem"),
//   cert: fs.readFileSync("./cert.pem"),
// };

// // Función para generar XSRF token basado en auth_token
// function generateXsrfToken(jwtToken) {
//   return crypto
//     .createHmac("sha256", process.env.SECRET_KEY)
//     .update(JSON.stringify(jwtToken))
//     .digest("hex");
// }

// // Endpoint para autenticar con Google Identity Services
// app.post('/auth/google/callback', async (req, res) => {
//   const { id_token } = req.body;
//   if (!id_token) {
//     return res.status(400).json({ error: 'ID token is required' });
//   }

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = ticket.getPayload();

//     // Datos del usuario extraídos del ID token
//     const user = {
//       id: payload.sub,
//       name: payload.name,
//       email: payload.email,
//       picture: payload.picture,
//     };

//     // Generar auth_token (JWT) y XSRF token
//     const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: "1h" });
//     const xsrfToken = generateXsrfToken(token);

//     // Guardar cookies seguras
//     res.cookie("auth_token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "Strict",
//       domain: "localhost",
//       path: "/",
//       maxAge: 60 * 60 * 1000, // 1 hora
//     });
//     res.cookie("XSRF-TOKEN", xsrfToken, {
//       httpOnly: false,
//       secure: true,
//       sameSite: "Strict",
//       domain: "localhost",
//       path: "/",
//       maxAge: 60 * 60 * 1000,
//     });

//     res.status(200).json({ message: "Login exitoso" });
//   } catch (error) {
//     console.error("Error al verificar ID token:", error);
//     res.status(401).json({ error: "Invalid ID token" });
//   }
// });

// // Middleware para validar auth_token y XSRF-TOKEN
// function validateAuth(req, res, next) {
//   const auth_token = req.cookies["auth_token"];
//   const xsrfToken = req.cookies["XSRF-TOKEN"];
//   const xsrfHeader = req.headers["x-xsrf-token"];

//   if (!auth_token || !xsrfToken || !xsrfHeader || xsrfToken !== xsrfHeader) {
//     return res.status(401).json({ error: "Not Authorized" });
//   }

//   // Verificar JWT
//   try {
//     const decoded = jwt.verify(auth_token, process.env.SECRET_KEY);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "Token inválido o expirado" });
//   }
// }

// // Rutas
// app.get("/login", (req, res) => {
//   res.send(`
//     <form>
//       <div id="buttonDiv"></div>
//       <script src="https://accounts.google.com/gsi/client" async defer></script>
//       <script>
//         google.accounts.id.initialize({
//           client_id: '${process.env.GOOGLE_CLIENT_ID}',
//           callback: (response) => {
//             fetch('/auth/google/callback', {
//               method: 'POST',
//               credentials: 'include',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({ id_token: response.credential })
//             }).then(res => {
//               if(res.ok) window.location.href = '/home';
//               else alert('Error al iniciar sesión');
//             });
//           }
//         });
//         google.accounts.id.renderButton(
//           document.getElementById("buttonDiv"),
//           { theme: "outline", size: "large" }
//         );
//       </script>
//     </form>
//   `);
// });

// app.get("/logout", (req, res) => {
//   res.clearCookie("auth_token");
//   res.clearCookie("XSRF-TOKEN");
//   res.status(200).redirect(`/login`);
// });

// app.get("/api/protected", validateAuth, (req, res) => {
//   res.json({ data: "Información sensible", user: req.user });
// });

// app.get("/user/profile", validateAuth, (req, res) => {
//   res.json({ user: req.user });
// });

// app.get("/", (req, res) => res.send("Hola Mundo!"));
// app.get("/dashboard", validateAuth, (req, res) => res.send({ message: "Acceso autorizado" }));

// // Cargar routers de tus módulos
// const estudianteRouter = require('./routes/estudianteindex');
// const personaRoutes = require('./routes/personaindex');
// const docenteRoutes = require('./routes/docenteindex');
// const asignaturaRoutes = require('./routes/asignaturaindex');
// const categoriaEmpleadoRoutes = require('./routes/categoriaEmpleadoindex');
// const contratoRoutes = require('./routes/contratoindex');
// const inscripcionesRoutes = require('./routes/inscripcionindex');

// app.use('/estudiantes', validateAuth, estudianteRouter);
// app.use('/personas', validateAuth, personaRoutes);
// app.use('/docentes', validateAuth, docenteRoutes);
// app.use('/asignaturas', validateAuth, asignaturaRoutes);
// app.use('/categoriaEmpleados', validateAuth, categoriaEmpleadoRoutes);
// app.use('/contratos', validateAuth, contratoRoutes);
// app.use('/inscripciones', validateAuth, inscripcionesRoutes);

// app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
// app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Error interno del servidor' });
// });

// // Iniciar servidor HTTPS
// https.createServer(options, app).listen(port, () => {
//   console.log(`Server running at https://localhost:${port}`);
// });
