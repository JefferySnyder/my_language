import { eval_assignement, eval_binary_expr, eval_call_expr, eval_identifier, eval_object_expr } from "./eval/expressions.js";
import { eval_function_declaration, eval_program, eval_var_declaration } from "./eval/statements.js";


export function evaluate(astNode, env) {

    switch (astNode.kind) {
        case "NumericLiteral":
            return { value: astNode.value, type: "number" };
        case "Identifier":
            return eval_identifier(astNode, env);
        case "ObjectLiteral":
            return eval_object_expr(astNode, env);
        case "CallExpr":
            return eval_call_expr(astNode, env);
        case "AssignmentExpr":
            return eval_assignement(astNode, env);
        case "BinaryExpr":
            return eval_binary_expr(astNode, env);
        case "Program":
            return eval_program(astNode, env);
        case "VarDeclaration":
            return eval_var_declaration(astNode, env);
        case "FunctionDeclaration":
            return eval_function_declaration(astNode, env);
        
        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode);
            process.exit(0);
    }

}