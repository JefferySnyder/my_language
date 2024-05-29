# My_Language

A small programming language created for educational purposes.

## Overview

This programming language was created in order to better understand the methods by which many languages parse and execute tokens.
It supports various fundamental programming concepts such as variable-declaration, 
function calling, and proper order of operations, with additions to be made in the future. 
The language syntax pulls from very common standards, such as function bodies being wrapped in brackets, let and const keywords used for variable declaration, and object properties accessible via the [object.value] operator. The language's grammar and syntax rules can be found in the examples below as well as some programs that the language can run. The language can be tested via the terminal with the "repl()" function or via the "test.txt" with the "run()" function.

## Examples of Working Programs

### Program Instantiation

```javascript
const parser = new Parser();
const env = createGlobalEnv();

const input = fs.readFileSync(filename, 'utf-8');
const program = parser.produceAST(input);
const result = evaluate(program, env);
```

### Basic Variable Declaration

```javascript
let z;

const x = 3;
const y = 5;

z = y - x
print(z)
```

### Basic Object Declaration

```javascript
const obj = {
    x: 100,
    y: 32,
    complex: {
        bar: true,
    },
};

print(obj)
```

### Basic Function Calling

```javascript
fn add(x, y) {
    x + y
}
print(add(x, y))
```

### Order of Operations

```javascript
fn equalsTen() {
    (4 - 5) * 8 + 6 / 1 + 12
}

print(equalsTen())
```