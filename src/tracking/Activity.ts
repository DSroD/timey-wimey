import { Tag, toString } from "../tags/Tag";

type Activity = {
    /* Timestamp of the start of the activity */
    start: number;
    /* Timestamp of the end of the activity */
    stop?: number | undefined;
    /* Project name */
    projectName: string;
    /* Additional tags */
    additionalTags: Tag[];
};

export type FinishedActivity = Activity & { stop: number; };

var currentActivity : Activity | null = null;

export function startActivity(projectName: string, additionalTags: Tag[]): Activity {
    const newActivity: Activity =  {
        start: Date.now(),
        projectName,
        additionalTags
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

export function toHumanReadableString(activity: Activity) {
    const startString = new Date(activity.start).toLocaleString();
    const endString = !!activity.stop ? new Date(activity.stop).toLocaleString() : "Not finished!";
    const tags = activity.additionalTags.map(x => toString(x)).join(", ");
    return `Project: ${activity.projectName}, Start time: ${startString}, End time: ${endString}, Tags: ${tags}\n`;
}

export function toJson(activity: Activity) {
    return JSON.stringify(activity);
}

export function toCsv(activity: Activity) {
    const startString = new Date(activity.start).toISOString();
    const endString = !!activity.stop ? new Date(activity.stop).toISOString() : "";
    // TODO: separate csv sanitizing into special function
    const joinedTags = activity.additionalTags.join(", ");
    const doubledQuotes = joinedTags.replace('"', '""');
    const tags = `"${doubledQuotes}"`;
    const data = [activity.projectName, startString, endString, tags].join(", ");
}

export default Activity;