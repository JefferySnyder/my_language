import { evaluate } from "../interpreter.js";
import { MK_NULL } from "../values.js";

export function eval_program(program, env) {
    let lastEvaluated = MK_NULL();
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env);
    }

    return lastEvaluated;
}

export function eval_var_declaration(declaration, env) {
    const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL();
    return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_function_declaration(declaration, env) {
    const fn = {
        type: "function",
        name: declaration.name,
        parameters: declaration.parameters,
        declarationEnv: env,
        body: declaration.body,
    };

    return env.declareVar(declaration.name, fn, true);
}