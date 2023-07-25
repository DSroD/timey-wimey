import { window } from "vscode";
import { Tag, setWorkspaceTags } from "../tags/Tag";
import TWCommand, { CommandCallback } from "./TWCommand";

const addWorkspaceTag: CommandCallback = async (ctx, appState) => {
    const userInput = await window.showInputBox({
        title: "New Tag",
        prompt: "Enter new tag as key:value pair",
        placeHolder: "Key:Value",
    });

    if (!userInput) { return appState; }

    const parsedTagM = parseKeyValue(userInput);

    if (!parsedTagM) {
        window.showErrorMessage("Invalid input format for tag. Please enter tag as Tag:Value pair.");
        return appState;
    }

    // Tag already existing - updating
    const existingTag = appState.projectTags.find(x => x.key === parsedTagM.key);
    if (!!existingTag) {
        const filteredTags = appState.projectTags.filter(x => x.key !== parsedTagM.key);
        const newTags = [...filteredTags, parsedTagM];
        setWorkspaceTags(ctx, newTags);
        window.showInformationMessage(`Updating tag ${existingTag.key} value from ${existingTag.value} to ${parsedTagM.value}`);
        return {...appState, projectTags: newTags};
    }

    const newTags = [...appState.projectTags, parsedTagM];
    setWorkspaceTags(ctx, newTags);
    window.showInformationMessage(`Creating new tag ${parsedTagM.key} with value ${parsedTagM.value}`);
    return {...appState, projectTags: newTags};

};

const parseKeyValue = (kvstring: string): Tag | null => {
    const splitted = kvstring.split(":");
    if (splitted.length !== 2) {
        return null;
    }

    const newTag = {
        key: splitted[0].trim().toLowerCase(),
        value: splitted[1].trim()
    };

    return newTag;
};

const addWorkspaceTagCommand: TWCommand = {
    commandName: "Add project tag to workspace",
    commandId: "timeyWimey.addTag",
    commandCallback: addWorkspaceTag,
};

export default addWorkspaceTagCommand;