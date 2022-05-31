import express from "express";
const app = express();
import morgan from "morgan";
import crypto from "crypto";
import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/requestbin");

const requestSchema = new mongoose.Schema({
  headers: { type: Map, of: String },
  body: String,
});

const Request = mongoose.model("Request", requestSchema);

requestSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

function headersParser(req) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const contentType = req.header("Content-Type");
  const method = req.method;
  const accept = req.header("Accept");
  const body = req.body;
  const headers = { contentType, method, accept, ip, body };
  console.debug(headers);

  return headers;
}
function binID() {
  return crypto.randomBytes(8).toString("hex");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morgan.token("headers", headersParser);

app.use(morgan(":headers"));

app.all("/request", async (req, res) => {
  const headers = req.headers;
  const body = req.body;

  const newRequest = new Request({
    headers: headers,
    body: JSON.stringify(body),
  });

  const mongoResp = await newRequest.save();

  let id = mongoResp._id.toString();

  res.json(mongoResp);
});

app.get("/", function (req, res) {
  res.send("Hello World");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
