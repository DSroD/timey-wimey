import { Subscription } from "../extension";

interface Timer {
    id: number,
    // In seconds
    interval: number,
    repeatable: boolean,
    dispose: () => void,
};

type SubscriptionFn = (...sub: Subscription[]) => void;

const timers: Map<string, Timer> = new Map();

export const initializeTimers = (subscribe: SubscriptionFn) => {
    const timerDisposable = {
        dispose: stopAll
    };
    subscribe(timerDisposable);
};

export const startTimer = (
    name: string,
    callbackFn: () => void,
    intervalSeconds: number,
    repeatable: boolean = false,
) => {
    if (timers.has(name)) { return null; }

    if (!repeatable) {
        callbackFn = () => {
            callbackFn();
            timers.delete(name);
        };
    }

    const intervalId = repeatable 
        ? +setInterval(callbackFn, intervalSeconds * 1000)
        : +setTimeout(callbackFn, intervalSeconds * 1000);

    const dispose = repeatable 
    ? () => {
        timers.delete(name);
        clearInterval(intervalId);
    }
    : () => {
        timers.delete(name);
        clearTimeout(intervalId);
    };

    const timer = {
        id: intervalId,
        interval: intervalSeconds,
        repeatable,
        dispose,
    };

    timers.set(name, timer);
    return timer;
};

// TODO: Use some result type
export const stopTimer = (name: string) => timers.get(name)?.dispose();

export const stopAll = () => timers.forEach(x => x.dispose());

export const isRunning = (name: string) => timers.has(name);