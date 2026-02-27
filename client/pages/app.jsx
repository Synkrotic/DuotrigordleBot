import "./style.css";
import { useEffect, useRef, useState } from "react";

import { useDiscord } from "../discordContext";
import Keyboard from "../components/keyboard/keyboard";
import Duotrigordle from "../components/duotrigordle/duotrigordle";
import LoadingPage from "./loading";
import KeyBoardManager from "../components/keyboard/keyboardmanager";

export default function App() {
    const { ready } = useDiscord();

	const [inputs, setInputs] = useState([]);
	const [guesses, setGuesses] = useState([]);
	const [solved, setSolved] = useState(new Set());

	const inputsRef = useRef([]);
	const guessesRef = useRef([]);
	const keyboardManager = useRef(new KeyBoardManager(inputsRef, guessesRef, setInputs, setGuesses));


	function addSolved(index) {
		setSolved(new Set([...solved, index]))
	}

	useEffect(() => {
		// Keyboard inputs
		window.addEventListener("keydown", keyboardManager.current.onKeyPressEvent);

		return () => window.removeEventListener("keydown", keyboardManager.current.onKeyPressEvent);
	}, [])


	if (!ready) return <LoadingPage />;
    return (
        <>
			<header>
				<h2 className="title">Duotrigordle</h2>
				<div className="flex-center gap20px">
					<p>Guesses: {guesses.length}</p>
					<p>Solved: {solved.size}/32</p>
				</div>
			</header>
			<main>
				<Duotrigordle
					inputs={inputs}
					guesses={guesses}
					guessesRef={guessesRef}
					setGuesses={setGuesses}
					setSolved={addSolved}
				/>
				<Keyboard keyboardManager={keyboardManager.current} />
			</main>
        </>
    );
}