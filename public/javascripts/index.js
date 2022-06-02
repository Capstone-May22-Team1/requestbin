const copyBtn = document.querySelector('#copyBtn');

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    let copyText = document.querySelector('#bin-url');
    navigator.clipboard.writeText(copyText.textContent);
    alert('Copied to clipboard!');
  });
}
