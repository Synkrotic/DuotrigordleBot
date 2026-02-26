import { isValidKey } from "./keys";
import { useEffect } from "react";

const KEY_ICONS = {
    backspace: "⌫",
    enter: "⏎",
};

export default function Key({ children, keyboardManager }) {
    if (!isValidKey(children)) return;

    const icon = KEY_ICONS[children];
    
    const label = icon || children;
    const isActionButton = !!icon;

    useEffect(() => {
    }, [keyboardManager])

    return (
        <button 
            className={`key ${isActionButton ? "actionable" : ""}`}
            onClick={() => keyboardManager.onKeyPress(children)}
        >
            {label}
        </button>
    );
}