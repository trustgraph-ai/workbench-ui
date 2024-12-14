
export interface Value {
    v : string,
    e : boolean,
    label? : string,
    direc? : string,
};

export interface PartialTriple {
    s? : Value,
    p? : Value,
    o? : Value,
};

export interface Triple {
    s : Value,
    p : Value,
    o : Value,
};

