import { saveRequest, getPayloads } from './mongodb.js';
import {
  storeRequestToBin,
  createUserBin,
  isValidBin,
  retrieveBinRequests,
} from './postgres.js';

async function storeRequest(req, binID) {
  const requestID = await saveRequest(req);
  const specificHeaders = await storeRequestToBin(req, binID, requestID);
}

async function listBinRequests(binID) {
  const response = await retrieveBinRequests(binID);
  const requests = response.rows
  const ids = requests.map((request) => request.request_body_id);
  const payloads = await getPayloads(ids);

  requests.forEach((request) => {
    request.body = payloads[request.request_body_id].body;
    request.headers = payloads[request.request_body_id].headers;
  });
  return requests;
}

export {
  storeRequest,
  createUserBin,
  isValidBin,
  retrieveBinRequests,
  listBinRequests,
};
