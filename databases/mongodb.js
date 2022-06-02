import mongoose from 'mongoose';

/*
const ids =  [
    '4ed3ede8844f0f351100000c',
    '4ed3f117a844e0471100000d', 
    '4ed3f18132f50c491100000e',
];
Using Mongoose with callback:

Model.find().where('_id').in(ids).exec((err, records) => {}

*/

mongoose.connect('mongodb://localhost:27017/requestbin');

const requestSchema = new mongoose.Schema({
  headers: { type: Map, of: String },
  body: String,
});

const Request = mongoose.model('Request', requestSchema);

async function saveRequest(req) {
  const headers = req.headers;
  const body = req.body;

  const newRequest = new Request({
    headers: headers,
    body: JSON.stringify(body),
  });

  const mongoResp = await newRequest.save();

  return mongoResp._id.toString();
}

async function getPayloads(requestIDs) {
  const payloads = await Request.find({ _id: { $in: requestIDs } }).lean();
  return payloadsToHash(payloads);
}
function payloadsToHash(payloads) {
  const hash = {};
  payloads.forEach(payload => {
    hash[payload._id.toString()] = {headers: payload.headers, body: payload.body} 
  })
  return hash;
}

export { saveRequest, getPayloads };
