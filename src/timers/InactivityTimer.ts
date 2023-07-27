import { Event, window, workspace } from "vscode";
import { registerConfigurationKey } from "../config/ConfigChangeDispatcher";
import { startTimer, stopTimer } from "./Timers";
import { getActivity } from "../tracking/Activity";
import { toggleActivity } from "../extension";


const activityCheckTimerName = 'inactivityCheckTimer';
const turnOffDelayInMs = 1000 * 60 * 5; // 5 minutes
const activityCheckIntervalSeconds = 30;
var active = false;
var modalShown = false;

var lastActivity: number = 0;
var intervalSeconds = 0;

export const initializeInactivityTimer = (...activityEvents: Event<any>[]) => {
    const getIntervalMinutesFromConfig = () => workspace.getConfiguration('timeyWimey')
        .get<number>('inactivityTimer.maxInactivityTime');

    // Initialize from config
    intervalSeconds = (getIntervalMinutesFromConfig() ?? 0) * 60;

    registerConfigurationKey('inactivityTimer.maxInactivityTime', async (newValue: number) => {
        intervalSeconds = newValue;
        // Check enabled and activity is running
        if (newValue > 0 && !!getActivity()) {
            // 30 second timer to check
            startActivityCheck();
            return;
        }
        // Check disabled and activity is running
        if (newValue <= 0 && !!getActivity()) {
            stopActivityCheck();
        }
    });
    
    activityEvents.forEach(x => x(() => activityPing()));

};

/**
 * Starts activity timer
 * @returns 
 */
export const startActivityCheck = () => {
    if (active) { return; }
    if (intervalSeconds <= 0) { return; }
    startTimer(
        activityCheckTimerName,
        checkActivity,
        activityCheckIntervalSeconds,
        true
    );
    lastActivity = Date.now();
    active = true;
};

export const stopActivityCheck = () => {
    if (!active) { return; }
    stopTimer(activityCheckTimerName);
    active = false;
};

const checkActivity = () => {
    const diff = (Date.now() - lastActivity);
    const intervalInMs = intervalSeconds * 1000;

    // diff + 5 minutes and activity is running
    if (diff > intervalInMs + turnOffDelayInMs && !!getActivity()) {
        toggleActivity();
        stopActivityCheck();
        return;
    }

    if (diff > intervalInMs) {
        showWarning();
        return;
    }
};

const showWarning = () => {
    // TODO: options
    if (modalShown) { return; }
    modalShown = true;
    window.showWarningMessage(
        "You seem to be inactive! Time tracking will be turned off in 5 minutes!",
        {modal: true},
        ).then(() => {
            // Modal was closed - user is active
            lastActivity = Date.now();
            modalShown = false;
        });
};

export const activityPing = () => {
    lastActivity = Date.now();
};