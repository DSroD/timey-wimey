import { ExtensionContext, SecretStorage, WorkspaceConfiguration, window } from "vscode";
import IRecorderConfiguration, { fromWorkspaceConfiguration } from "../../../config/IRecorderConfiguration";
import { ITrackingRecorder, ITrackingRecorderFactory } from "../../ITrackingRecorder";
import { GraphQLClient } from "graphql-request";
import { createTagMutation, createTimeSpan, getAllTagsQuery, loginMutation } from "./Queries";
import { LoginResponse, TagList } from "./TraggoTypes";
import Activity, { setAdditionalRecorderData } from "../../Activity";

export type TraggoRecorderFactory = ITrackingRecorderFactory<TraggoRecorderConfiguration>;

export type TraggoRecorder = ITrackingRecorder<TraggoRecorderConfiguration>;

export interface TraggoRecorderConfiguration extends IRecorderConfiguration {
    apiEndpoint: string,
};

// TODO: re-login to traggo when token expires

const key = 'traggo';
const name = 'Traggo Activity Recording';

const create =
    async (ctx: ExtensionContext, cfg: WorkspaceConfiguration) => {
        const configuration: TraggoRecorderConfiguration = fromWorkspaceConfiguration(
            key, defaultConfiguration, cfg,
        );

        const client = new GraphQLClient(configuration.apiEndpoint, { errorPolicy: 'none' });
        
        // Perform login
        const session = await login(ctx, client);
        if (!session) {
            window.showErrorMessage("Error: Traggo could not log in! Check recorder settings!");
            return null;
        }

        client.setHeader("Authorization", `traggo ${session.token}`);
        
        const recordActivity = async (activity: Activity) => {
            // TODO: separate to functions
            // Get tags to be created and create them
            const tagsWithProject = [...activity.additionalTags, {key: "project", value: activity.projectName}];
            const existingTags = (await client.request<TagList>(getAllTagsQuery)).tags
                .map(x => x.key);
            const tagsToBeCreated = tagsWithProject.filter(x => !existingTags.includes(x.key));
            const queryDatas = tagsToBeCreated.map(x => ({key: x.key}));
            // TODO: batch
            queryDatas.forEach(async x => await client.request(createTagMutation, x));

            // Send activity
            const data = {
                start: new Date(activity.start).toISOString(),
                end: (!!activity.stop) ? new Date(activity.stop).toISOString() : null,
                tags: tagsWithProject,
            };

            const newId = await client.request<number>(createTimeSpan, data);
            setAdditionalRecorderData("traggo.activityId", newId);
        };

        const dispose = () => {
            
        };

        return ({
            recordActivity,
            dispose,
            key,
        });
    };

const defaultConfiguration: TraggoRecorderConfiguration = {
    apiEndpoint: "endpoint",
};

const userKey = "timeyWimey.recorders.traggo.username";
const passKey = "timeyWimey.recorders.traggo.password";

const login = async (ctx: ExtensionContext, client: GraphQLClient) => {
    const credentials = await tryGetCredentials(ctx.secrets);
    if (!credentials) {
        return null;
    }

    const session = await client.request<LoginResponse>(loginMutation, credentials);
    if ("login" in session) {
        await ctx.secrets.store(userKey, credentials.user);
        await ctx.secrets.store(passKey, credentials.pass);
        return session.login;
    }
    return null;
};

const tryGetCredentials = async (storage: SecretStorage) => {
    const user = (await storage.get(userKey)) ?? (await askForCredential(
        "Traggo Username:", "Username", false));
    if (!user) {
        return null;
    }
    const pass = (await storage.get(passKey)) ?? (await askForCredential(
        "Traggo Password:", "Password", true));
    if (!pass) {
        return null;
    }
    return ({
        user,
        pass,
    });
};

const askForCredential = async (propmt: string, placeHolder: string, password: boolean) => {
    const input = await window.showInputBox(
        {
            prompt: propmt,
            placeHolder: placeHolder,
            password: password,
        }
    );
    return input;
};

const traggoRecorderFactory: TraggoRecorderFactory = ({
    name,
    key,
    defaultConfiguration,
    create,
});

export default traggoRecorderFactory;
