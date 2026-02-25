import "./style.css";
import { useEffect, useRef, useState } from "react";

import { useDiscord } from "../discordContext";
import Keyboard from "../components/keyboard/keyboard";
import Duotrigordle from "../components/duotrigordle";
import LoadingPage from "./loading";
import KeyBoardManager from "../components/keyboard/keyboardmanager";

export default function App() {
    const { participants, ready } = useDiscord();
	const [inputs, setInputs] = useState([]);

	const keyboardManager = useRef(new KeyBoardManager(setInputs));
	const game = useRef(new Duotrigordle(keyboardManager.current));

	useEffect(() => {
		window.addEventListener("keydown", keyboardManager.current.onKeyPressEvent);

		return () => window.removeEventListener("keydown", keyboardManager.current.onKeyPressEvent);
	}, [])



	if (!ready) return <LoadingPage />;
    return (
        <>
			<header>
				<h2 className="title">Duotrigordle</h2>
				<nav></nav>
			</header>
			<main>
				{ game.current.render() }
				<Keyboard manager={keyboardManager.current} />
			</main>
        </>
    );
}