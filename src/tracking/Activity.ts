type Activity = {
    /* Timestamp of the start of the activity */
    start: number;
    /* Timestamp of the end of the activity */
    stop?: number | undefined;
    /* Project name */
    projectName: string;
    /* Additional tags */
    additionalTags: string[];
};

export type FinishedActivity = Activity & { stop: number; };

var currentActivity : Activity | null = null;

export function startActivity(projectName: string, additionalTags: string[]): Activity {
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

export default Activity;