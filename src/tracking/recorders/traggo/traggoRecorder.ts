import { ExtensionContext, WorkspaceConfiguration, window } from "vscode";
import IRecorderConfiguration, { fromWorkspaceConfiguration } from "../../../config/recorderConfiguration";
import { ITrackingRecorder, ITrackingRecorderFactory } from "../../trackingRecorder";
import { GraphQLClient } from "graphql-request";
import { createTagMutation, createTimeSpan, getAllTagsQuery, loginMutation } from "./queries";
import { TagList } from "./traggoTypes";
import Activity, { setAdditionalRecorderData } from "../../activity";
import { Tag } from "../../../tags/tag";
import { withCredentials } from "./graphClient";
import { isTWError } from "../../../errors/twError";

type TraggoRecorderFactory = ITrackingRecorderFactory<TraggoRecorderConfiguration>;

export interface TraggoRecorderConfiguration extends IRecorderConfiguration {
    apiEndpoint: string,
};

const key = 'traggo';
const name = 'Traggo Activity Recording';
const traggoIdAdditionalDataKey = 'traggo.activityId';

const create =
    async (ctx: ExtensionContext, cfg: WorkspaceConfiguration): Promise<ITrackingRecorder | null> => {
        const configuration: TraggoRecorderConfiguration = fromWorkspaceConfiguration(
            key, defaultConfiguration, cfg,
        );

        const client = new GraphQLClient(configuration.apiEndpoint, { errorPolicy: 'none' });

        const request = withCredentials(ctx, client);
        
        const recordActivity = async (activity: Activity) => {
            // Get tags to be created and create them
            const tagsWithProject = [...activity.additionalTags, {key: "project", value: activity.projectName}];
            const result = await createNonExistingProjectTagsInTraggo(tagsWithProject);
            if (isTWError(result)) {
                window.showErrorMessage(result.message);
                return;
            }

            // Send activity
            const data = {
                start: new Date(activity.start).toISOString(),
                end: (!!activity.stop) ? new Date(activity.stop).toISOString() : null,
                tags: tagsWithProject,
            };

            const newId = await request<number>(createTimeSpan, data);
            if (isTWError(newId)) {
                window.showErrorMessage(newId.message);
                return;
            }
            // Update with traggo id of this activity
            setAdditionalRecorderData(traggoIdAdditionalDataKey, newId);
        };

        const recordEndActivity = async (activity: Activity) => {
            // There is no ID saved for this activity - create it as a new activity
            if (!activity.additionalRecorderData.has(traggoIdAdditionalDataKey)) {
                recordActivity(activity);
                return;
            }
            // Activity already exists in Traggo
            const traggoId = activity.additionalRecorderData.get(traggoIdAdditionalDataKey);
            // TODO: update activity in Traggo

        };

        const createNonExistingProjectTagsInTraggo = async (tags: Tag[]) => {
            const existingTagsResponse = await request<TagList>(getAllTagsQuery);
            if (isTWError(existingTagsResponse)) { return existingTagsResponse; }

            const existingTags = existingTagsResponse.tags.map(x => x.key);
            const tagsToBeCreated = tags.filter(x => !existingTags.includes(x.key));
            const queryDatas = tagsToBeCreated.map(x => ({key: x.key}));
            // TODO: batch?
            queryDatas.forEach(async x => await request<{key: string}>(createTagMutation, x));
        };

        const dispose = () => {
            
        };

        return ({
            recordStartActivity: recordActivity,
            recordEndActivity: recordEndActivity,
            dispose,
            key,
        });
    };

const defaultConfiguration: TraggoRecorderConfiguration = {
    apiEndpoint: "endpoint",
};

const traggoRecorderFactory: TraggoRecorderFactory = ({
    name,
    key,
    defaultConfiguration,
    create,
});

export default traggoRecorderFactory;
