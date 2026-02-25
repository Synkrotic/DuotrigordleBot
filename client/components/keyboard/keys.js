export const keyboardRows = {
    first: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    second: ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    third: ["backspace", "z", "x", "c", "v", "b", "n", "m", "enter"]
};

export function isValidKey(key) {
    return Object.values(keyboardRows)
        .some(row => row.includes(key));
}