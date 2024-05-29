import Environment from "../environment.js";
import { evaluate } from "../interpreter.js";
import { MK_NULL } from "../values.js";

function eval_numeric_binary_expr(lhs, rhs, operator) {
    let result;
    if (operator === "+") {
        result = lhs.value + rhs.value;
    } else if (operator === "-") {
        result = lhs.value - rhs.value;
    } else if (operator === "*") {
        result = lhs.value * rhs.value;
    } else if (operator === "/") {
        // TODO: Division by zero checks
        result = lhs.value / rhs.value;
    } else {
        result = lhs.value % rhs.value;
    }

    return { value: result, type: "number"};
}

export function eval_binary_expr(binop, env) {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    if (lhs.type === "number" && rhs.type === "number") {
        return eval_numeric_binary_expr(lhs, rhs, binop.operator);
    }

    // One or both are NULL
    return MK_NULL();
}

export function eval_identifier(ident, env) {
    const val = env.lookupVar(ident.symbol);
    return val;
}

export function eval_assignement (node, env) {
    if (node.assigne.kind !== "Identifier") {
        throw `Invalid LHS inside assignment expr ${JSON.stringify(node.assigne)}`;
    }

    const varname = (node.assigne).symbol;
    return env.assignVar(varname, evaluate(node.value, env));
}

export function eval_object_expr(obj, env) {
    const object = { type: "object", properties: new Map() };
    for (const { key, value } of obj.properties) {
        const runtimeVal = (value === undefined) ? env.lookupVar(key) : evaluate(value, env);

        object.properties.set(key, runtimeVal);
    }
    return object;
}

export function eval_call_expr(expr, env) {
    const args = expr.args.map((arg) => evaluate(arg, env));
    const fn = evaluate(expr.caller, env);

    if (fn.type === "native-fn") {
        const result = fn.call(args, env);
        return result;
    }

    if (fn.type === "function") {
        const func = fn;
        const scope = new Environment(func.declarationEnv);

        // Create the variables for the parameters list
        for (let i = 0; i < func.parameters.length; i++) {
            // TODO Check the bounds here
            // verify arity of function
            const varname = func.parameters[i];
            scope.declareVar(varname, args[i], false);
        }

        let result = MK_NULL();
        // Evaluate the function body line by line
        for (const stmt of func.body) {
            result = evaluate(stmt, scope);
        }

        return result;
    }

    throw "Cannot call value that is not a function: " + JSON.stringify(fn);
}