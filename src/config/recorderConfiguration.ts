import { WorkspaceConfiguration } from 'vscode';
import { ITrackingRecorderFactory } from '../tracking/trackingRecorder';

export default interface IRecorderConfiguration {
    
}

export const fromWorkspaceConfiguration = <TConfiguration extends IRecorderConfiguration> (
    recorderKey: string,
    defaultConfiguration: TConfiguration,
    cfg: WorkspaceConfiguration,
): TConfiguration => {
    const defaultEntries = Object.entries(defaultConfiguration);
    const configuration = defaultEntries.map(
        ([k, v]) => [k, (cfg.get(`recorders.${recorderKey}.${k}`) ?? v)]
    );
    return Object.fromEntries(configuration) as TConfiguration;
};
