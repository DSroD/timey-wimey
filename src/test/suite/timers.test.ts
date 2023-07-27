import assert = require("assert");
import { isRunning, startTimer, stopAll } from "../../timers/Timers";

suite('Timers Test Suite', () => {

    test('Timer is created pushed to timers on creation', () => {
        const timer = startTimer('testTimer', () => {}, 1);
        assert.strictEqual(isRunning('testTimer'), true);
    });

    test('All timers are removed stopAll', () => {
        const timersNames = ['timer1', 'timer2', 'timer3'];
        timersNames.forEach(x => startTimer(x, () => {}, 1));
        stopAll();
        const areRunning = timersNames.map(x => isRunning(x));
        assert.deepStrictEqual(areRunning, [false, false, false]);
    });

});
