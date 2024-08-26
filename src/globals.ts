import { NodeAPI } from 'node-red';

import IssueService from './common/services/IssueService';
import Storage from './common/services/Storage';

export let RED: NodeAPI;
export let issueService: IssueService;
export let storageService: Storage;

export function setRED(val: NodeAPI): void {
    RED = val;
}

export function setIssues(service: IssueService): void {
    issueService = service;
}

export function setStorage(storage: Storage): void {
    storageService = storage;
}
