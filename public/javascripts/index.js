const createBtn = document.querySelector('#createBtn');
const copyBtn = document.querySelector('#copyBtn');
const binURL = document.querySelector('#bin-url');
const searchBin = document.querySelector('#search-bin');
const searchBinBtn = document.querySelector('#search-bin-btn');

const requestsList = document.querySelector('#requests');

if (createBtn) {
  createBtn.addEventListener('click', () => {
    fetch('/createbin')
      .then((res) => res.json())
      .then(({ payload }) => {
        binURL.textContent = payload;
        binURL.style.visibility = 'visible';
        copyBtn.style.visibility = 'visible';
      });
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(binURL.textContent);
    alert('Copied to clipboard!');
  });
}

if (searchBinBtn) {
  searchBinBtn.addEventListener('click', async () => {
    const searchBinURL = searchBin.value;
    const res = await fetch(`bins/${searchBinURL}`);
    const data = await res.json();
    let requests = data.payload;
    let requestsString = '';

    requests.forEach((request) => {
      let reqString = '';
      for (const [key, value] of Object.entries(request)) {
        reqString += `<li class="headers">
            <p class="header">
            <span>${key}:${value}</span>
            </p>
          </li>`;
      }
      requestsString += `<li class="request"><ul>${reqString}</ul>`;
    });
    requestsList.innerHTML = requestsString;
  });
}
