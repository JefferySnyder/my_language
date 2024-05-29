export function MK_NULL() {
    return { type: "null", value: null};
}

export function MK_BOOL(b = true) {
    return { type: "boolean", value: b};
}

export function MK_NUMBER(n = 0) {
    return { type: "number", value: n};
}

export function MK_NATIVE_FN(call) {
    return { type: "native-fn", call};
}