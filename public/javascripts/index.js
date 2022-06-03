const createBtn = document.querySelector('#createBtn');
const copyBtn = document.querySelector('#copyBtn');
const binURL = document.querySelector('#bin-url');

createBtn.addEventListener('click', () => {
  fetch('/createbin')
    .then((res) => res.json())
    .then(({ payload }) => {
      binURL.textContent = payload;
    });
});

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(binURL.textContent);
    alert('Copied to clipboard!');
  });
}
