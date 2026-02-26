/**
 * Duotrigordle Daily Word Extractor
 *
 * Replicates the game's source logic to determine today's 32 answer words.
 * Matches the following JS functions: DA() (RNG), nr() (puzzle number), KA() (word selection).
 */


// ─── Constants ────────────────────────────────────────────────────────────────

// The game launched on this date (used to compute puzzle numbers)
const LAUNCH_DATE = new Date("2022-03-03T00:00:00Z");

// Puzzles before #684 used an NYT-sourced word list; #684+ use the default list
const NYT_LIST_CUTOFF = 684;

// Each daily puzzle has 32 boards
const NUM_BOARDS = 32;

// Seeds for non-normal challenge modes are offset by these amounts
const SEQUENCE_SEED_OFFSET = Math.floor(100_000 / 3);
const JUMBLE_SEED_OFFSET	 = Math.floor((100_000 * 2) / 3);

const CHALLENGE_SEED_OFFSETS = {
	normal:	 0,
	sequence: SEQUENCE_SEED_OFFSET,
	jumble:	 JUMBLE_SEED_OFFSET,
	perfect:	0,
};

const FOLDER = "../../resources/words/";


// ─── Mersenne Twister RNG ─────────────────────────────────────────────────────

/**
 * Create a Mersenne Twister RNG seeded with `seed`.
 * Matches the game's DA() function. Returns a callable that yields uint32 values.
 */
function makeRng(seed) {
	const MT_SIZE	 = 624;
	const MT_PERIOD = 397;
	const MATRIX_A	= 0x9908B0DF;

	const mt = new Uint32Array(MT_SIZE);
	mt[0] = seed >>> 0;
	for (let i = 1; i < MT_SIZE; i++) {
		const prev = mt[i - 1];
		mt[i] = Number((BigInt(1812433253) * BigInt(prev ^ (prev >>> 30)) + BigInt(i)) & 0xFFFFFFFFn);
	}

	let index = [MT_SIZE];	// stored in array so the closure can mutate it

	function _twist() {
		for (let i = 0; i < MT_SIZE; i++) {
			const highBit	= mt[i] & 0x80000000;
			const lowBits	= mt[(i + 1) % MT_SIZE] & 0x7FFFFFFF;
			const combined = (highBit | lowBits) >>> 0;
			mt[i] = (mt[(i + MT_PERIOD) % MT_SIZE] ^ (combined >>> 1)) >>> 0;
			if (combined & 1) mt[i] = (mt[i] ^ MATRIX_A) >>> 0;
		}
		index[0] = 0;
	}

	function nextUint32() {
		if (index[0] >= MT_SIZE) _twist();

		let y = mt[index[0]];
		index[0]++;

		// Tempering
		y ^= y >>> 11;
		y ^= (y << 7)	& 0x9D2C5680;
		y ^= (y << 15) & 0xEFC60000;
		y ^= y >>> 18;

		return y >>> 0;
	}

	return nextUint32;
}


// ─── Puzzle helpers ───────────────────────────────────────────────────────────

/**
 * Return the puzzle number for a given date (defaults to today).
 * Puzzle #1 was on 2022-03-03. Matches the game's nr() function.
 */
function puzzleNumberFor(target = new Date()) {
	const dt = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
	const daysElapsed = (dt - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24);
	return Math.floor(daysElapsed) + 1;
}

/** Return 'default' or 'nyt' depending on which list this puzzle uses. */
function wordListForPuzzle(puzzleNumber) {
	return puzzleNumber >= NYT_LIST_CUTOFF ? "default" : "nyt";
}


// ─── Word selection ───────────────────────────────────────────────────────────

/**
 * Pick the 32 answer words for a given puzzle. Matches the game's KA() function.
 *
 * @param {number}	 puzzleNumber	- The daily puzzle index (1-based).
 * @param {string[]} wordList			- The full list of candidate answer words.
 * @param {string}	 challenge		 - One of 'normal', 'sequence', 'jumble', or 'perfect'.
 */
function pickDailyWords(puzzleNumber, wordList, challenge = "normal") {
	if (!(challenge in CHALLENGE_SEED_OFFSETS)) {
		throw new Error(`Unknown challenge mode: "${challenge}"`);
	}

	const seed			 = puzzleNumber + CHALLENGE_SEED_OFFSETS[challenge];
	const nextUint32 = makeRng(seed);

	const chosen = [];
	const seen	 = new Set();

	while (chosen.length < NUM_BOARDS) {
		const word = wordList[nextUint32() % wordList.length];
		if (!seen.has(word)) {
			chosen.push(word);
			seen.add(word);
		}
	}

	return chosen;
}


// ─── Word list loading ────────────────────────────────────────────────────────

/**
 * Fetch a word list from a URL and return it as an array of strings.
 * @param {string} url
 * @returns {Promise<string[]>}
 */
async function loadWordList(url) {
	const response = await fetch(url);
	const text		 = await response.text();
	return text.split("\n").filter(Boolean);
}


// ─── Word lists (loaded once, shared across calls) ────────────────────────────

let _defaultWords = null;
let _nytWords		 = null;
let _validGuesses = null;

async function getWordLists() {
	if (!_defaultWords) {
		[_defaultWords, _nytWords, _validGuesses] = await Promise.all([
			loadWordList(`${FOLDER}default_answers_2653.txt`).then(words => (
				words.map(
					w => w
						.replaceAll("\r", "")
						.toLowerCase()
				)
			)),
			loadWordList(`${FOLDER}answers_2313.txt`).then(words => (
				words.map(
					w => w
						.replaceAll("\r", "")
						.toLowerCase()
				)
			)),
			loadWordList(`${FOLDER}valid_guesses_14857.txt`).then(words => (
				new Set(words.map(
					w => w
						.replaceAll("\r", "")
						.toLowerCase()
				)))
			),
		]);
	}
	return { defaultWords: _defaultWords, nytWords: _nytWords, validGuesses: _validGuesses };
}


// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns today's 32 answer words.
 * @returns {Promise<string[]>}
 */
export async function getTodaysWords() {
	const { defaultWords, nytWords } = await getWordLists();
	const puzzleNum = puzzleNumberFor(new Date());
	const listName	= wordListForPuzzle(puzzleNum);
	const wordList	= listName === "default" ? defaultWords : nytWords;
	return pickDailyWords(puzzleNum, wordList);
}

/**
 * Returns true if the word is a valid guess.
 * @param {string} word
 * @returns {Promise<boolean>}
 */
export async function isValidWord(word) {
		const { validGuesses } = await getWordLists();
		return validGuesses.has(word.toLowerCase());
}