import express from 'express';
const app = express();
import morgan from 'morgan';
import 'express-async-errors';
import crypto from 'crypto';
import {
  createUserBin,
  storeRequest,
  isValidBin,
  retrieveBinRequests,
  listBinRequests,
} from './databases/index.js';

import { getPayloads } from './databases/mongodb.js';

let binURL = '';

app.set('view engine', 'pug');
app.use(express.static('public'));

function binID() {
  return crypto.randomBytes(8).toString('hex');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/bins/request/:id', async (req, res, next) => {
  const binID = req.params['id'];
  const isValid = await isValidBin(binID);
  if (!isValid) {
    return next(new Error(`Request bin with ${binID} not found.`));
  }
  const specificHeaders = await storeRequest(req, binID);

  res.sendStatus(200);
});

app.get('/', function (req, res) {
  res.render('index.pug', {
    binURL,
  });
});

app.get('/createbin', async (req, res) => {
  binURL = await createUserBin();
  res.redirect('/');
});

app.get('/bins/:id', async (req, res) => {
  const requests = await listBinRequests(req.params['id']);
  res.render('requests.pug', { requests });
});

function errorHandler(err, req, res, next) {
  res.status(404);
  res.json({ error: err.message });
}
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
