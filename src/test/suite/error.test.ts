
import assert = require("assert");
import { asTWError, isTWError } from "../../errors/twError";

suite('TWErrors Test suite', () => {
    test('TWError constructor from msg test', () => {
        const result = asTWError("msg");
        const expected = {
            _key: "error",
            message: "msg"
        };
        assert.deepStrictEqual(result, expected);
    });

    test('TWError predicate test', () => {
        const values = [
            asTWError("err"),
            {test: 1},
            new Map([["a", "b"]]),
            5,
            undefined,
            null
        ];
        const expected = [
            true, false, false, false, false, false
        ];

        const results = values.map(isTWError);

        assert.deepStrictEqual(results, expected);
    });

});
