import { Tag, toString } from "../tags/tag";

type Activity = {
    /* Timestamp of the start of the activity */
    start: number;
    /* Timestamp of the end of the activity */
    stop?: number | undefined;
    /* Project name */
    projectName: string;
    /* Additional tags */
    additionalTags: Tag[];
    additionalRecorderData: Map<string, any>;
};

export type FinishedActivity = Activity & { stop: number; };

var currentActivity : Activity | null = null;

export function startActivity(projectName: string, additionalTags: Tag[]): Activity {
    const additionalRecorderData = new Map<string, any>();
    const newActivity: Activity =  {
        start: Date.now(),
        projectName,
        additionalTags,
        additionalRecorderData,
    };

    currentActivity = newActivity;
    return newActivity;
}

export function stopActivity(): FinishedActivity | null {
    if (!currentActivity) { return null; }

    const previousActivity = {...currentActivity, stop: Date.now() };
    currentActivity = null;
    return previousActivity;
}

export function getActivity(): Activity | null {
    return currentActivity;
}

export function setAdditionalRecorderData(key: string, value: any) {
    return currentActivity?.additionalRecorderData.set(key, value);
}

export function getAdditionalRecorderData<T>(key: string): T | null {
    if (!currentActivity) { return null; }
    return currentActivity.additionalRecorderData.get(key) ?? null as T | null;
}

export function toHumanReadableString(activity: Activity) {
    const startString = new Date(activity.start).toLocaleString();
    const endString = !!activity.stop ? new Date(activity.stop).toLocaleString() : "Not finished!";
    const tags = activity.additionalTags.map(x => toString(x)).join(", ");
    return `Project: ${activity.projectName}, Start time: ${startString}, End time: ${endString}, ${tags}\n`;
}

export function toJson(activity: Activity) {
    const replacer = (x: any, value: any) => {
        if (x === "additionalRecorderData") { return undefined; }
        if (x === "start" || x === "stop") { return new Date(value as number).toISOString(); }
        return value;
    };
    return JSON.stringify(activity, replacer);
}

export function toCsv(activity: Activity) {
    const startString = new Date(activity.start).toISOString();
    const endString = !!activity.stop ? new Date(activity.stop).toISOString() : "";
    // TODO: separate csv sanitizing into special function
    const joinedTags = activity.additionalTags
        .map(x => `${x.key}:${x.value}`)
        .join(", ");
    const doubledQuotes = joinedTags.replace('"', '""');
    const tags = `"${doubledQuotes}"`;
    const data = [activity.projectName, startString, endString, tags].join(", ");
    return `${data}\n`;
}

export function activityLenghtSeconds(activity: Activity) {
    const endOrNow = activity.stop ?? Date.now();
    const msDelta = endOrNow - activity.start;
    return Math.floor(msDelta / 1000);
}

export default Activity;
