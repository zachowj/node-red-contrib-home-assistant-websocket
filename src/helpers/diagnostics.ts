import axios from 'axios';
import fs from 'fs/promises';
import os from 'os';

import { RED } from '../globals';
import { homeAssistantConnections } from '../homeAssistant';
import packageVersion from '../version';

let addonVersionCached: string | undefined;
let isDockerCached: boolean | undefined;

async function hasDockerEnv() {
    try {
        await fs.stat('/.dockerenv');
        return true;
    } catch {
        return false;
    }
}

async function hasDockerCGroup() {
    try {
        return (await fs.readFile('/proc/self/cgroup', 'utf8')).includes(
            'docker'
        );
    } catch {
        return false;
    }
}

async function isRunningInDocker() {
    isDockerCached ??= (await hasDockerEnv()) || (await hasDockerCGroup());

    return isDockerCached;
}

interface HomeAssistantDiagnostic {
    serverId: string;
    version: string;
    integrationVersion: string;
}

function getHomeAssistantServers(): HomeAssistantDiagnostic[] {
    const servers = [];
    for (const [id, ha] of homeAssistantConnections) {
        const server: HomeAssistantDiagnostic = {
            serverId: id,
            version: ha.version,
            integrationVersion: ha.integrationVersion,
        };
        if (!ha.isConnected) {
            server.version = 'unknown';
        }
        if (!ha.isHomeAssistantRunning) {
            server.integrationVersion = 'unknown';
        }
        servers.push(server);
    }

    return servers;
}

function getHomeAssistantVersionText(): string {
    const servers = getHomeAssistantServers();
    if (servers.length === 0) {
        return 'No Home Assistant server configured\n';
    }

    if (servers.length === 1) {
        const server = servers[0];
        return (
            `Home Assistant version: ${server.version}\n` +
            `Companion version: ${server.integrationVersion}\n`
        );
    }

    let content = `Home Assistant instances: ${servers.length}\n`;
    for (const server of servers) {
        content +=
            `Server: ${server.serverId}\n` +
            `Home Assistant version: ${server.version}\n` +
            `Companion version: ${server.integrationVersion}\n`;
    }

    return content;
}

interface AddonInfo {
    result: string;
    data: { version: string };
}
async function getAddonVersion(): Promise<string> {
    if (addonVersionCached) return addonVersionCached;

    try {
        const response = await axios.get<any, AddonInfo>(
            'http://supervisor/addons/self/info',
            {
                headers: {
                    Authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}`,
                },
            }
        );
        addonVersionCached = response.data.version;
        return addonVersionCached;
    } catch (err) {
        return 'error fetching version';
    }
}

export async function getEnvironmentData() {
    const content =
        `Version: ${packageVersion}\n` +
        `\n` +
        `${getHomeAssistantVersionText()}` +
        `\n` +
        `Node-RED version: ${RED.version()}\n` +
        `Docker: ${(await isRunningInDocker()) ? 'yes' : 'no'}\n` +
        `Add-on: ${
            process.env.SUPERVISOR_TOKEN ? await getAddonVersion() : 'no'
        }\n` +
        `\n` +
        `Node.js version: ${process.version} ${process.arch} ${process.platform}\n` +
        `OS: ${os.type()} ${os.release()} ${os.arch()}\n`;

    return content;
}
