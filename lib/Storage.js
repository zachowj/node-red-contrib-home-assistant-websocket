const FileAsync = require('lowdb/adapters/FileAsync');
const low = require('lowdb');

let DB;

class Storage {
    constructor(id, RED) {
        this.id = id;
        this.RED = RED;
    }

    get databaseId() {
        return `nodes.${this.id.replace('.', '_')}`;
    }

    async getDb() {
        if (DB) return DB;

        let dbLocation = this.RED.settings.userDir;
        if (!dbLocation) {
            throw new Error('Could not find userDir to use for database store');
        }
        dbLocation += '/node-red-contrib-home-assistant-websocket.json';

        const adapter = new FileAsync(dbLocation);
        DB = await low(adapter);
        DB.defaults({
            nodes: {},
        });

        return DB;
    }

    // namespaces data by nodeid to the lowdb store
    async saveData(key, value) {
        if (!this.id || !key) {
            throw new Error('cannot persist data to db without id and key');
        }
        const path = `${this.databaseId}.${key}`;
        const db = await this.getDb();

        return db.set(path, value).write();
    }

    async getData(key) {
        if (!this.id) {
            throw new Error('cannot get node data from db without id');
        }
        const db = await this.getDb();
        let path = `${this.databaseId}`;
        if (key) path = path + `.${key}`;

        return db.get(path).value();
    }

    async removeData() {
        if (!this.id) {
            throw new Error('cannot get node data from db without id');
        }
        const db = await this.getDb();

        return db.unset(this.databaseId).write();
    }
}

module.exports = Storage;
