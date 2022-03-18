import express from 'express';

const router = express.Router();

import { getAllEntries } from '../controllers/iomsController.js';

router.route('/').get(getAllEntries);

export default router;
