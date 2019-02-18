let words = [];
let currentJokeId;
let intialStart = true;
let currOccurrences;

/**
 * initialization
 * @returns {Promise<void>}
 */
async function initialize() {
  const $el = document.getElementById('joke');
  window.localStorage.setItem('cachedJokes', '[]');
  const { joke, id } = await fetchRandomJoke();
  $el.innerText = joke;
  cacheJokeById(id);
  splitWords(joke);
  intialStart = false;
  currOccurrences = findMostOccurence(joke);
}

/**
 * cache the joke by id
 * @param id
 */
function cacheJokeById(id) {
  const item = JSON.parse(localStorage.getItem('cachedJokes'));
  if (item.indexOf(id) < 0) {
    item.push(id);
  }
  window.localStorage.setItem('cachedJokes', JSON.stringify(item));
}

/**
 * check if joke has been generated/seen
 * @param id
 * @returns {boolean}
 */
function hasBeenGenerated(id) {
  const item = JSON.parse(localStorage.getItem('cachedJokes'));
  return item.indexOf(id) > -1;
}

/**
 * get a random word from the array
 * @returns {*}
 */
function getRandomWord() {
  const index = Math.floor(Math.random() * words.length);
  return words[index];
}

/**
 * find the word that occurs the most in the array
 * @param str
 * @returns {*|{}}
 */
function findMostOccurence(str) {
  return words.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
}

/**
 * get a random joke
 * @returns {Promise<any>}
 */
async function fetchRandomJoke() {
  try {
    const resp = await fetch(`https://icanhazdadjoke.com/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    const json = await resp.json();
    currentJokeId = json.id;
    return json;
  } catch (err) {
    console.log('%c err', 'background: red; color: white;', err)
  }
}

/**
 * get a joke by string
 * @param str
 * @returns {Promise<null|SpeechRecognitionResult>}
 */
async function fetchJokeByWord(str) {
  try {
    const resp = await fetch(`https://icanhazdadjoke.com/search?term=${str}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    const json = await resp.json();
    let data;
    if (json.results.length) {
      const index = Math.floor(Math.random() * json.results.length);
      data = json.results[index];
      currentJokeId = data.id;
    } else {
      data = null;
    }
    return data;
  } catch (err) {
    console.log('%c err', 'background: red; color: white;', err)
  }
}

/**
 * split the words out into an array
 * @param str
 * @returns {Array}
 */
function splitWords(str) {
  words = [];
  const nlpText = window.nlp_compromise.text(str);
  const terms = nlpText.terms();
  terms.forEach((item, i) => {
    words.push(item.text);
  });
  return words;
}

/**
 * @returns {Promise<void>}
 */
async function generate() {
  const $el = document.getElementById('joke');

  if (intialStart === false || !hasBeenGenerated(currentJokeId)) {
    const mostOccurrences = Object.keys(currOccurrences).reduce((a, b) => currOccurrences[a] > currOccurrences[b] ? a : b);
    const { joke, id } = await fetchJokeByWord(mostOccurrences);
    $el.innerText = joke;
    cacheJokeById(id);
    splitWords(joke);
    currOccurrences = findMostOccurence(joke);
  } else {
    console.log('Joke has been seen! Generating new one');
    initialize();
  }
}

window.addEventListener('load', () => initialize());
