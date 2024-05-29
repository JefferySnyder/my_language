import { tokenize } from "./lexer.js";

export default class Parser {
    tokens = [];

    not_eof() {
        return this.tokens[0].type !== "EOF";
    }

    at() {
        return this.tokens[0];
    }

    eat() {
        const prev = this.tokens.shift();
        return prev;
    }

    expect(type, err) {
        const prev = this.tokens.shift();
        if (!prev || prev.type !== type) {
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            process.exit(1);
        }

        return prev;
    }
    
    produceAST(sourceCode) {
        this.tokens = tokenize(sourceCode);
        const program = {
            kind: "Program",
            body: [],
        };

        // Parse until eof
        while (this.not_eof()) {
            program.body.push(this.parse_stmt())
        }

        return program;
    }

    parse_stmt() {
        switch (this.at().type) {
            case "Let":
            case "Const":
                return this.parse_var_declaration();
            case "Fn":
                return this.parse_fn_declaration();

            default:
                return this.parse_expr();
        }
    }

    parse_fn_declaration() {
        this.eat(); // eat fn keyword
        const name = this.expect("Identifier", "Expected function name following fn keyword").value;

        const args = this.parse_args();
        const params = [];
        for (const arg of args) {
            if (arg.kind !== "Identifier") {
                console.log(arg);
                throw "Inside function declaration expected parameters to be of type string.";
            }

            params.push(arg.symbol);
        }

        this.expect("OpenBrace", "Expected function body following declaration.");

        const body = [];

        while (this.not_eof() && this.at().type !== "CloseBrace") {
            body.push(this.parse_stmt());
        }

        this.expect("CloseBrace", "Closing brace expected inside function declaration");
        const fn = { body, name, parameters: params, kind: "FunctionDeclaration" };

        return fn;
    }

    parse_var_declaration() {
        const isConstant = this.eat().type === "Const";
        const identifier = this.expect("Identifier", "Expected identifier name following let | const keywords.").value;

        if (this.at().type === "Semicolon") {
            this.eat();
            if (isConstant) {
                throw "Must assign value to constant expression. No value provided.";
            }
            return { kind: "VarDeclaration", identifier, constant: false };
        }

        this.expect("Equals", "Expected equals token following identifier in var declaration");
        const declaration = { kind: "VarDeclaration", value: this.parse_expr(), identifier, constant: isConstant};

        this.expect("Semicolon", "Variable declaration statement must end with semicolon");
        return declaration;
    }

    parse_expr() {
        return this.parse_assignment_expr();
    }

    parse_assignment_expr() {
        const left = this.parse_object_expr();

        if (this.at().type === "Equals"){
            this.eat(); // advance past equals
            const value = this.parse_assignment_expr();
            return { value, assigne: left, kind: "AssignmentExpr" };
        }

        return left;
    }

    parse_object_expr() {
        if (this.at().type !== "OpenBrace") {
            return this.parse_additive_expr();
        }

        this.eat(); // advance past brace
        const properties = [];

        while (this.not_eof() && this.at().type !== "CloseBrace") {
            const key = this.expect("Identifier", "Object literal key expected").value;

            // Allows shorthand key: pair -> { key, }
            if (this.at().type === "Comma") {
                this.eat(); // advance past comma
                properties.push({ key, kind: "Property", value: undefined });
                continue;
            } // Allows shorthand key: pair -> { key }
            else if (this.at().type === "CloseBrace") {
                properties.push({ key, kind: "Property", value: undefined });
                continue;
            }

            // { key: value }
            this.expect("Colon", "Missing colon following identifier in ObjectExpr");
            const value = this.parse_expr();

            properties.push({ kind: "Property", value, key });
            if (this.at().type !== "CloseBrace") {
                this.expect("Comma", "Expected comma or closing bracket following property.");
            }
        }

        this.expect("CloseBrace", "Object literal missing closing brace.");
        return { kind: "ObjectLiteral", properties };
    }

    parse_additive_expr() {
        let left = this.parse_multiplicative_expr();

        while (this.at().value === "+" || this.at().value === "-") {
            const operator = this.eat().value;
            const right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            };
        }
        
        return left;
    }

    parse_multiplicative_expr() {
        let left = this.parse_call_member_expr();

        while (this.at().value === "/" || this.at().value === "*" || this.at().value === "%") {
            const operator = this.eat().value;
            const right = this.parse_call_member_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            };
        }
        
        return left;
    }

    parse_call_member_expr() {
        const member = this.parse_member_expr();

        if (this.at().type === "OpenParen") {
            return this.parse_call_expr(member);
        }

        return member;
    }

    parse_call_expr(caller) {
        let call_expr = { kind: "CallExpr", caller, args: this.parse_args() };

        if (this.at().type === "OpenParen") {
            call_expr = this.parse_call_expr(call_expr);
        }

        return call_expr;
    }

    parse_args() {
        this.expect("OpenParen", "Expected open parenthesis.");
        const args = this.at().type === "CloseParen" ? [] : this.parse_arguments_list();

        this.expect("CloseParen", "Missing closing parenthesis inside arguments list.");
        return args;
    }

    parse_arguments_list() {
        const args = [this.parse_assignment_expr()];

        while (this.at().type === "Comma" && this.eat()) {
            args.push(this.parse_assignment_expr());
        }

        return args;
    }

    parse_member_expr() {
        let object = this.parse_primary_expr();

        while (this.at().type === "Dot" || this.at().type === "OpenBracket") {
            const operator = this.eat();
            let property;
            let computed;

            // non-computed values aka obj.expr
            if (operator.type === "Dot"){
                computed = false;
                // get identifier
                property = this.parse_primary_expr();
                
                if (property.kind !== "Identifier") {
                    throw `Cannot use dot operator without right hand side being an identifier`;
                }
            } else {
                computed = true;
                property = this.parse_expr();
                this.expect("CloseBracket", "Missing closing bracket in computed value.");
            }

            object = {
                kind: "MemberExpr",
                object,
                property,
                computed,
            };
        }

        return object;
    }
 
    parse_primary_expr() {
        const tk = this.at().type;

        // console.log(tk);

        switch (tk) {
            case "Identifier":
                return { kind: "Identifier", symbol: this.eat().value };
            case "Number":
                return { kind: "NumericLiteral", value: parseFloat(this.eat().value) };
            case "OpenParen": {
                this.eat();
                const value = this.parse_expr();
                this.expect("CloseParen", "Unexpected token found inside parenthesized expression. Expected closing parenthesis.")
                return value;
            }

            default:
                console.error("Unexepected token found during parsing!", this.at());
                process.exit(1);
        }
    }
}