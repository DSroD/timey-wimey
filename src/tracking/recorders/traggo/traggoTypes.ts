export type User = {
    id: number,
    name: string,
};

export type DeviceType = "LongExpiry" | "ShortExpiry" | "NoExpiry";

export type Device = {
    id: number,
    name: string,
    type: DeviceType,
};

export type LoginResponse = {
    login: {
        token: string,
        user: User,
        device: Device,
    },
};

export type TagList = {
    tags: {key: string}[],
};
