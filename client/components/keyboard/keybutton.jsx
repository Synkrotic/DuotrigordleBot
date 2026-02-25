import { isValidKey } from "./keys";

const KEY_ICONS = {
    backspace: "⌫",
    enter: "⏎",
};

export default function Key({ children, manager }) {
    if (!isValidKey(children)) return;

    const icon = KEY_ICONS[children];
    
    const label = icon || children;
    const isActionButton = !!icon;

    return (
        <button 
            className={`key ${isActionButton ? "actionable" : ""}`}
            onClick={() => manager.onKeyPress(children)}
        >
            {label}
        </button>
    );
}