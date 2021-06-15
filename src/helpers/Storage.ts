import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';

let DB: low.LowdbAsync<any>;

export default class Storage {
    private id;
    private path;

    constructor({ id, path }: { id: string; path: string }) {
        this.id = id;
        this.path = path;
    }

    get databaseId(): string {
        return `nodes.${this.id.replace('.', '_')}`;
    }

    async getDb(): Promise<low.LowdbAsync<any>> {
        if (DB) return DB;

        if (!this.path) {
            throw new Error('Could not find userDir to use for database store');
        }
        const dbLocation = `${this.path}/node-red-contrib-home-assistant-websocket.json`;

        const adapter = new FileAsync(dbLocation);
        DB = await low(adapter);
        DB.defaults({
            nodes: {},
        });

        return DB;
    }

    // namespaces data by nodeid to the lowdb store
    async saveData(
        key: string,
        value: string | number | boolean
    ): Promise<void> {
        if (!this.id || !key) {
            throw new Error('cannot persist data to db without id and key');
        }
        const path = `${this.databaseId}.${key}`;
        const db = await this.getDb();

        await db.set(path, value).write();
    }

    async getData(key: string): Promise<string | number | boolean> {
        if (!this.id) {
            throw new Error('cannot get node data from db without id');
        }
        const db = await this.getDb();
        let path = `${this.databaseId}`;
        if (key) path = path + `.${key}`;

        return db.get(path).value();
    }

    async removeData(): Promise<boolean> {
        if (!this.id) {
            throw new Error('cannot get node data from db without id');
        }
        const db = await this.getDb();

        return db.unset(this.databaseId).write();
    }
}
