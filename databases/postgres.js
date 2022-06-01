import pg from "pg";
const { Client } = pg;
import crypto from "crypto";
const dbName = "requestbin";

const dbInfo = {
  user: "team1",
  host: "localhost",
  database: dbName,
  password: "1234",
  port: 5432,
};

(async function initializeDatabase() {
  const postgresClient = new Client({ ...dbInfo, database: "postgres" });
  const requestBinClient = new Client(dbInfo);

  try {
    await postgresClient.connect();
    // create requestbin database if not exists
    createDatabaseAndTables();
  } catch {}

  async function createDatabaseAndTables() {
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
    const createDatabase = `CREATE DATABASE ${dbName}`;
    try {
      await postgresClient.query(createDatabase);
      await requestBinClient.connect();
      await requestBinClient.query(createBinTable);
      await requestBinClient.query(createRequestTable);
    } catch {
    } finally {
      postgresClient.end();
      requestBinClient.end();
    }
  }
})();

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
    text: `INSERT INTO bins ("url")
    VALUES ($1);`,
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
  console.log(response.rows.length);
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
  console.log(response.rows);
  return response;
}

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
