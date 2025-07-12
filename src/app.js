
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const config = require("./config");
const routes = require("./routes");
const swaggerSpecs = require("./config/swagger");

const {
  errorHandler,
  notFoundHandler,
} = require("./middlewares/error.middleware");
const logger = require("./utils/logger");

const app = express();

app.use(helmet());


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));


app.use(compression());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      message: "Too many requests from this IP, please try again later",
      status: 429
    }
  }
});
app.use(limiter);


if (config.NODE_ENV !== "test") {
  app.use(morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger API Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Membership Management API Documentation'
}));

// Redirect base URL to Swagger Docs
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});


// API Routes
app.use("/api/v1", routes);

// Error Handling Middleware
app.use(notFoundHandler);  // 404 Handler
app.use(errorHandler);     // Global Error Handler

module.exports = app;
