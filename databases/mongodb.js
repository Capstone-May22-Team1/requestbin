import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/requestbin");

const requestSchema = new mongoose.Schema({
  headers: { type: Map, of: String },
  body: String,
});

const Request = mongoose.model("Request", requestSchema);

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

export { saveRequest };
