import "./style.css";
import { useEffect, useRef, useState } from "react";

import { useDiscord } from "../discordContext";
import Keyboard from "../components/keyboard/keyboard";
import Duotrigordle from "../components/duotrigordle/duotrigordle";
import LoadingPage from "./loading";
import KeyBoardManager from "../components/keyboard/keyboardmanager";

export default function App() {
    const { participants, ready } = useDiscord();
	const [inputs, setInputs] = useState([]);
	const [guesses, setGuesses] = useState([]);

	const keyboardManager = useRef(new KeyBoardManager(setInputs, setGuesses));

	useEffect(() => {
		window.addEventListener("keydown", keyboardManager.current.onKeyPressEvent);

		return () => window.removeEventListener("keydown", keyboardManager.current.onKeyPressEvent);
	}, [])


	if (!ready) return <LoadingPage />;
    return (
        <>
			<header>
				<h2 className="title">Duotrigordle</h2>
				<div>
					<p>Guesses: {guesses.length}</p>
				</div>
			</header>
			<main>
				<Duotrigordle
					inputs={inputs}
					guesses={guesses}
				/>
				<Keyboard keyboardManager={keyboardManager.current} />
			</main>
        </>
    );
}