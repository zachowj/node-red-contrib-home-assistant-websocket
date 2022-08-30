import StorageAdapter, { NodeData } from '../common/Storage.js';

// Temperarary until all nodes are moved to the new format
export default class Storage {
    private id;

    constructor({ id }: { id: string }) {
        this.id = id;
    }

    async saveData(key: keyof NodeData, value: any): Promise<void> {
        return StorageAdapter.saveNodeData(this.id, key, value);
    }

    async getData(key: keyof NodeData): Promise<any> {
        return StorageAdapter.getNodeData(this.id, key);
    }

    async removeData(): Promise<boolean> {
        return StorageAdapter.removeNodeData(this.id);
    }
}
