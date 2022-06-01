import pg from "pg";
const { Client } = pg;
import pgtools from "pgtools";
import crypto from "crypto";

const dbInfo = {
  user: "team1",
  host: "localhost",
  database: "requestbin",
  password: "1234",
  port: 5432,
};

function binID() {
  return crypto.randomBytes(8).toString("hex");
}

async function queryHelper(query) {
  const client = new Client(dbInfo);
  await client.connect();
  const response = await client.query(query);
  await client.end();
  return response;
}

async function createUserBin() {
  const id = binID();
  const insertBin = {
    text: `INSERT INTO bins (${client.escapeIdentifier("url")}) VALUES ($1);`,
    values: [id],
  };
  await queryHelper(insertBin);
  return id;
}

async function isValidBin(binID) {
  const checkID = {
    text: `SELECT * FROM bins WHERE url = $1;`,
    values: [binID],
  };
  const response = await queryHelper(checkID);
  console.log(response.rows.length)
  return response.rows.length === 1;
}

async function storeRequestToBin(req, binID, requestID) {
  const client = new Client(dbInfo);
  const { contentType, method, accept, ip, body } = headersParser(req);
  const insertRequest = {
    text: `
  INSERT INTO requests (bin_url, accept, http_method, sender_ip_address, request_body_id) VALUES
  ($1, $2, $3, $4, $5);
  `,
    values: [binID, accept, method, ip, requestID],
  };

  await queryHelper(insertRequest);
}

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

async function retrieveBinRequests(binID) {
  const selectRequests = {
    text: `
    SELECT * FROM bins
    INNER JOIN requests
    ON bins.url = requests.bin_url
    WHERE bin_url = $1;
    `,
    values: [binID],
  };
  const response = await queryHelper(selectRequests);
  console.log(response.rows)
  return response;
}

const client = new Client(dbInfo);

await client.connect((err) => {
  if (err) {
    // create requestbin database if not exists
    if (/database/.test(err.message)) {
      const config = { ...dbInfo };
      delete config.database;
      pgtools.createdb(config, "requestbin", function (err, res) {
        if (err) {
          console.error(err.type);
        }
        // retry connection to requestbin database
        client.connect((err, res) => {
          client.end();
        });
      });
    }
  }
});

const createBinTable = {
  text: `CREATE TABLE IF NOT EXISTS bins (
    id SERIAL PRIMARY KEY,
    url VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
  );`,
};

const createRequestTable = {
  text: `CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    bin_url VARCHAR REFERENCES bins (url) NOT NULL,
    accept VARCHAR NOT NULL,
    http_method VARCHAR NOT NULL,
    sender_ip_address VARCHAR NOT NULL,
    request_body_id VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
  )`,
};

await queryHelper(createBinTable);
await queryHelper(createRequestTable);

// client.query(createBinTable, (err, res) => {
//   console.log(err, res);
// });

// client.query(createRequestTable, (err, res) => {
//   console.log(err, res);
// });

// client.query(insertBin, (err, res) => {
//   console.log(err, res);
//   client.end();
// });

export { createUserBin, storeRequestToBin, isValidBin, retrieveBinRequests };
