export type TWError = {
    _key: "error",
    message: string,
};

export const isTWError = (response: any) : response is TWError => {
    if (response === null || response === undefined) { return false; }
    if (typeof(response) !== "object") { return false; }
    return ("_key" in response && response._key === "error");
};

export const errToTWError = (err: any): TWError => {
    if ("message" in err) {
        return {
            _key: "error",
            message: err.message
        };
    }
    return {
        _key: "error",
        message: "Unknown error during GQL request!"
    };
};

export const asTWError = (message: string): TWError => {
    return {
        _key: "error",
        message
    };
};