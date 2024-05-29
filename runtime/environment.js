import { MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER } from "./values.js";

export function createGlobalEnv() {
    const env = new Environment();
    // Create default Global Environment
    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);
    env.declareVar("null", MK_NULL(), true);

    // Define a native builtin method
    // TODO: prettify - use switch case
    env.declareVar("print", MK_NATIVE_FN((args, scope) => {
        console.log(...args);
        return MK_NULL();
    }), true);

    function timeFunction(args, env) {
        return MK_NUMBER(Date.now());
    }
    env.declareVar("time", MK_NATIVE_FN(timeFunction), true);

    return env;
}

export default class Environment {
    parent;
    variables;
    constants;

    constructor(parentENV) {
        const global = parentENV ? true : false;
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    declareVar(varname, value, constant) {
        if (this.variables.has(varname)) {
            throw `Cannot declare variable ${varname}. As it is already defined.`;
        }

        this.variables.set(varname, value);

        if (constant) {
            this.constants.add(varname);
        }
        return value;
    }

    assignVar(varname, value) {
        const env = this.resolve(varname);

        // Cannot assign to constant
        if (env.constants.has(varname)) {
            throw `Cannot reassign to variable ${varname} as it was declared constant.`;
        }

        env.variables.set(varname, value);
        return value;
    }

    lookupVar(varname) {
        const env = this.resolve(varname);
        return env.variables.get(varname);
    }

    resolve(varname) {
        if(this.variables.has(varname)) {
            return this;
        }
        if (this.parent === undefined) {
            throw `Cannot resolve ${varname} as it does not exist`;
        }

        return this.parent.resolve(varname);
    }
}