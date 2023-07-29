import TWCommand, { CommandCallback } from "./twCommand";
import { toggleActivity as toggle } from "../extension";


const toggleActivity: CommandCallback = async (ctx, appState) => {
    toggle();
    return appState;
};

const toggleTrackingCommand: TWCommand = {
    commandName: "Toggle tracking",
    commandId: "timeyWimey.toggleTracking",
    commandCallback: toggleActivity,
};

export default toggleTrackingCommand;
