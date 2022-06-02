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
} from './databases/index.js';

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

  console.log(specificHeaders);
  res.sendStatus(200);
});

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.get('/createbin', async (req, res) => {
  const binID = await createUserBin();
  res.send('Your bin id is ' + binID);
});

app.get('/bins/:id', async (req, res) => {
  const binRequests = await retrieveBinRequests(req.params['id']);
  res.send(JSON.stringify(binRequests));
});

function errorHandler(err, req, res, next) {
  res.status(404);
  res.json({ error: err.message });
}
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
