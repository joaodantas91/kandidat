export default defineContentScript({
  matches: ['<all_urls>'],
  main () {
    console.log('Hello content.');
    console.log('Kandidat active in:', window.location.hostname);
  },
});
