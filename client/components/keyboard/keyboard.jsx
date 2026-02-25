import { keyboardRows } from "./keys";
import Key from "./keybutton";

export default function Keyboard({ manager }) {
    const rows = [keyboardRows.first, keyboardRows.second, keyboardRows.third];

    return (
        <div className="keyboard-gui">
            {rows.map((row, rowIndex) => (
                <div className={`keyboard-row r${rowIndex}`} key={rowIndex}>
                    {row.map((key) => (
                        <Key key={key} manager={manager}>{key}</Key>
                    ))}
                </div>
            ))}
        </div>
    );
}