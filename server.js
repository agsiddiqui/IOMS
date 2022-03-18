import express from 'express';
const app = express();

import 'express-async-errors';

// middleware
import authRouter from './routes/auth.js';
import iomsRouter from './routes/ioms.js';

// Error handler
import notFoundMiddleWare from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';
import authenticateUser from './middleware/auth.js';

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome!' });
});
app.get('/api/v1', (req, res) => {
  res.json({ msg: 'API' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/ioms', authenticateUser, iomsRouter);

app.use(notFoundMiddleWare);
app.use(errorHandlerMiddleware);

export default app;
