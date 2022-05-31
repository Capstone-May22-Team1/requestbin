const express = require('express');
const app = express();
const morgan = require('morgan');
const crypto = require('crypto');

function headersParser(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
  const contentType = req.header('Content-Type');
  const method = req.method;
  const accept = req.header('Accept');
  const body = req.body;
  return {contentType, method, accept, ip, body};
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morgan.token('headers', headersParser);

app.use(morgan(' :headers'));


app.all('/request', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 

  // console.log('headers:', req.headers)
  // console.log('method:', req.method)
  // console.log('content-type:', req.header('content-type'))
  // console.log('Accept:', req.header('Accept'))
  // console.log('Sender IP:', ip)
  // console.log('Body', req.body)


})

app.get('/', function (req, res) {
  res.send('Hello World')
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))