import pg from "pg";
const { Client } = pg;
import pgtools from "pgtools";
import crypto from "crypto";

function binID() {
  return crypto.randomBytes(8).toString("hex");
}

const dbInfo = {
  user: "team1",
  host: "localhost",
  database: "requestbin",
  password: "1234",
  port: 5432,
};

const client = new Client(dbInfo);

client.connect((err) => {
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
        client.connect();
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
    path VARCHAR NOT NULL,
    accept VARCHAR NOT NULL,
    http_method VARCHAR NOT NULL,
    sender_ip_address VARCHAR NOT NULL,
    request_body_id VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
  )`,
};

client.query(createBinTable, (err, res) => {
  console.log(err, res);
});

client.query(createRequestTable, (err, res) => {
  console.log(err, res);
});

const insertBin = {
  text: `INSERT INTO bins (${client.escapeIdentifier("url")}) VALUES ($1);`,
  values: [String(binID())],
};

client.query(insertBin, (err, res) => {
  console.log(err, res);
  client.end();
});
