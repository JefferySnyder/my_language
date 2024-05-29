const KEYWORDS = {
    "let": "Let",
    "const": "Const",
    "fn": "Fn",
}

function token(value, type) {
    return { value, type };
}

function isalpha(src) {
    return src.toUpperCase() !== src.toLowerCase();
}

function isskippable(str) {
    return str === ' ' || str === '\n' || str === '\t' || str === '\r';
}

function isint(str) {
    const c = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (c >= bounds[0] && c <= bounds[1]);
}


export function tokenize(sourceCode) {
    const tokens = [];
    const src = sourceCode.split("");

    // Build until eof
    while (src.length > 0) {
        if (src[0] === '(') {
            tokens.push(token(src.shift(), "OpenParen"));
        } else if (src[0] === ')') {
            tokens.push(token(src.shift(), "CloseParen"));
        } else if (src[0] === '{') {
            tokens.push(token(src.shift(), "OpenBrace"));
        } else if (src[0] === '}') {
            tokens.push(token(src.shift(), "CloseBrace"));
        } else if (src[0] === '[') {
            tokens.push(token(src.shift(), "OpenBracket"));
        } else if (src[0] === ']') {
            tokens.push(token(src.shift(), "CloseBracket"));
        } else if (src[0] === '+' || src[0] === '-' || src[0] === '*' || src[0] === '/' || src[0] === '%') {
            tokens.push(token(src.shift(), "BinaryOperator"));
        } else if (src[0] === '=') {
            tokens.push(token(src.shift(), "Equals"));
        } else if (src[0] === ';') {
            tokens.push(token(src.shift(), "Semicolon"));
        } else if (src[0] === ':') {
            tokens.push(token(src.shift(), "Colon"));
        } else if (src[0] === ',') {
            tokens.push(token(src.shift(), "Comma"));
        } else if (src[0] === '.') {
            tokens.push(token(src.shift(), "Dot"));
        } else {
            // Handle multicharacter tokens

            // Build number token
            if (isint(src[0])) {
                let num = "";
                while (src.length > 0 && isint(src[0])) {
                    num += src.shift();
                }

                tokens.push(token(num, "Number"));
            } else if (isalpha(src[0])) {
                let ident = "";
                while (src.length > 0 && isalpha(src[0])) {
                    ident += src.shift();
                }

                // check for reserved keywords
                const reserved = KEYWORDS[ident];
                if (reserved === undefined) {
                    tokens.push(token(ident, "Identifier"));
                } else {
                    tokens.push(token(ident, reserved));
                }
            } else if (isskippable(src[0])) {
                src.shift(); // skip the current character
            } else {
                console.log("Unexpected character found in source: ", src[0]);
                process.exit(1);
            }
        }
    }

    tokens.push({ value: "EndOfFile", type: "EOF" });
    return tokens;
}