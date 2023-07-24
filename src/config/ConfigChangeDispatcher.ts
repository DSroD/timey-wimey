import { ConfigurationChangeEvent, workspace } from "vscode";

type Handler<TValue> = (newValue: TValue) => Promise<void>;

const dispatcher = new Map<string, Handler<any>>();

export const initialize = () => {
    return {
        dispose,
        dispatch,
    };
};

const dispose = () => {
    dispatcher.clear();
};

export const dispatch = (event: ConfigurationChangeEvent) => {
    dispatcher.forEach(async (handler, key) => {
        if (event.affectsConfiguration(`timeyWimey.${key}`)) {
            const newValue = workspace.getConfiguration('timeyWimey').get<any>(key);
            await handler(newValue);
        }
    });
};

export const registerConfigurationKey = <TValue> (key: string, handler: Handler<TValue>) => {
    dispatcher.set(key, handler);
};

export const unregisterConfigurationKey = (key: string) => {
    dispatcher.delete(key);
};
