import { AppState } from "../AppState";

interface TWCommand {
    commandName: string,
    commandId: string,
    commandCallback: (appState: AppState) => Promise<AppState>,
}

export default TWCommand;