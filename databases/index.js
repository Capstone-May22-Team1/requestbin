import { saveRequest } from './mongodb.js';
import { storeRequestToBin, createUserBin, isValidBin, retrieveBinRequests } from './postgres.js';

async function storeRequest(req, binID) {
  const requestID = await saveRequest(req);
  const specificHeaders = await storeRequestToBin(req, binID, requestID);
}

export { storeRequest, createUserBin, isValidBin, retrieveBinRequests }