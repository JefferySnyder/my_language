import Parser from "./frontend/parser.js";
import { evaluate } from "./runtime/interpreter.js";
import { createGlobalEnv } from "./runtime/environment.js";

// const prompt = require('prompt-sync')();
import promptSync from 'prompt-sync';
const prompt = promptSync();

// const fs = require('node:fs');
import * as fs from 'fs';

// repl();
run("./test.txt");

function run(filename) {
    const parser = new Parser();
    const env = createGlobalEnv();

    const input = fs.readFileSync(filename, 'utf-8');
    const program = parser.produceAST(input);
    const result = evaluate(program, env);
    // console.log(result);
}

function repl() {
    const parser = new Parser();
    const env = createGlobalEnv();

    console.log("\nRepl v0.1");
    while (true) {

        const input = prompt("> ");
        // Check for no user input or exit keyword
        if (!input || input.includes("exit")) {
            process.exit(1);
        }

        const program = parser.produceAST(input);

        const result = evaluate(program, env);
        console.log(result);
    }
}