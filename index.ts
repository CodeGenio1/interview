import 'dotenv/config';
import express from 'express';
import { initialize } from 'express-openapi';
import { setupDb } from './db';
import * as operations from './api/controllers';
import { basicScheme } from './api/helpers/security';
import { errorHandler } from './api/helpers/errorHandler';
const path = require('path');
const morgan = require('morgan');

setupDb();
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set views path
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// debugging tool, more like logging details
app.use(morgan('dev'));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

initialize({
  app,
  apiDoc: './api/schema.yaml',
  operations,
  securityHandlers: {
    // @ts-expect-error extra properties to our Request type
    basicScheme,
  },
  errorMiddleware: errorHandler
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;