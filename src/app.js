// Environment variables
import config from './utils/config.js';
// Project route path
import { __dirname } from './utils/fileUtils.js';
// Services
import express from 'express';
import { Server } from 'socket.io';
import session from 'express-session';
import handlebars from 'express-handlebars';
import MongoStore from 'connect-mongo';
import passport from 'passport';
// Persistence service
import MongoSingleton from './dao/mongo.js';
// Routes
import mainRouter from './routes/main.routes.js';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import messagesRouter from './routes/messages.routes.js';
import viewsRouter from './routes/views.routes.js';
import usersRouter from './routes/users.routes.js';
import initializePassport from './auth/passport.config.js';
import mockingRouter from './routes/mocking.routes.js';
import loggerTest from './routes/loggerTest.routes.js';
// Local services and Utils
import CustomError from './services/customErrors.js';
import { errorsDict } from './utils/errorsDict.js';
import { addLogger, logger } from './middlewares/logger.js';
// Documentation
import { swaggerSpecs } from './docs/swaggerOptions.js';
import swaggerUiExpress from 'swagger-ui-express';

const PORT = parseInt(config.PORT);
const WS_PORT = parseInt(config.WS_PORT);
const MONGOOSE_URL = config.MONGOOSE_URL;
const SESSION_SECRET = config.SESSION_SECRET;
const BASE_URL = `${config.URL}`;
const WS_URL = `${config.WS_URL}`;

// Server Creation
const server = express();
const httpServer = server.listen(WS_PORT, () => {
  logger.info(`${new Date().toLocaleTimeString()} - Socketio server active in port ${WS_PORT}`);
});
const wss = new Server(httpServer, {
  cors: {
    origin: BASE_URL,
    methods: ['GET', 'POST']
  }
});

// Parsing
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Logger
server.use(addLogger);

// Sessions persistence
const store = MongoStore.create({
  mongoUrl: MONGOOSE_URL,
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  ttl: 30
});
server.use(
  session({
    store,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 1500 } // 600 sec ó 10 min
  })
);
server.use(passport.initialize());
initializePassport();

// Entry point
server.use('/', mainRouter(store, BASE_URL));

// Enpoints API REST
server.use('/api/products', productsRouter(wss));
server.use('/api/carts', cartsRouter(BASE_URL));
server.use('/api/messages', messagesRouter(wss));
server.use('/api/users', usersRouter);

// Templates Engine
server.engine('handlebars', handlebars.engine());
server.set('view engine', 'handlebars');
server.set('views', `${__dirname}/views`);

// Enpoint Mocking
server.use('/mocking', mockingRouter);

// Enpoint logging testing
server.use('/loggerTest', loggerTest);

// Endpoint views
server.use('/', viewsRouter(BASE_URL, WS_URL));

// Static
server.use('/public', express.static(`${__dirname}/public`));

// Documentation
server.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpecs));

// Error handling
server.all('*', (req, res, next) => {
  throw new CustomError(errorsDict.ROUTING_ERROR);
});
server.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({ status: 'ERR', msg: err.message });
});

// Socket.io events
wss.on('connection', (socket) => {
  logger.info(`${new Date().toLocaleTimeString()} - Client connected (${socket.id})`);
  socket.emit('server_confirm', 'Client connection received');
  socket.on('disconnect', (reason) => {
    logger.info(`${new Date().toLocaleTimeString()} - Client disconnected (${socket.id}): ${reason}`);
  });
});

// Server activation and listening
try {
  MongoSingleton.getInstance();
  server.listen(PORT, () => {
    logger.info(`${new Date().toLocaleTimeString()} - Server active in port ${PORT}`);
  });
} catch (err) {
  logger.error(`${new Date().toLocaleTimeString()} - Couldn't connect to DB server`);
}
