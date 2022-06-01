import express from "express";
const app = express();
import morgan from "morgan";
import crypto from "crypto";
import { saveRequest } from "./databases/mongodb.js";
import {
  createUserBin,
  storeRequestToBin,
  isValidBin,
  retrieveBinRequests,
} from "./databases/postgres.js";

function binID() {
  return crypto.randomBytes(8).toString("hex");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/bins/request/:id", async (req, res) => {
  const binID = req.params["id"];
  const isValid = await isValidBin(binID)
  if (!isValid) {
    res.sendStatus(404);
  } else {
    const requestID = await saveRequest(req);
    const specificHeaders = await storeRequestToBin(req, binID, requestID);
    console.log(specificHeaders);

    res.sendStatus(200);
  }
});

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/createbin", async (req, res) => {
  const binID = await createUserBin();
  res.send("Your bin id is " + binID);
});

app.get("/bins/:id", async (req, res) => {
  const binRequests = await retrieveBinRequests(req.params["id"]);
  res.send(JSON.stringify(binRequests));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
