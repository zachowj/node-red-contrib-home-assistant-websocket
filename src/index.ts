import { NodeAPI } from 'node-red';

import IssueService from './common/services/IssueService';
import Storage from './common/services/Storage';
import { NodeType } from './const';
import { setIssues, setRED, setStorage } from './globals';
import { getExposedSettings } from './helpers/exposed-settings';
import actionNode from './nodes/action';
import apiNode from './nodes/api';
import binarySensorNode from './nodes/binary-sensor';
import buttonNode from './nodes/button';
import configServerNode from './nodes/config-server';
import currentStateNode from './nodes/current-state';
import deviceNode from './nodes/device';
import deviceConfigNode from './nodes/device-config';
import entityNode from './nodes/entity';
import entityConfigNode from './nodes/entity-config';
import eventsAllNode from './nodes/events-all';
import eventsCalendarNode from './nodes/events-calendar';
import eventsStateNode from './nodes/events-state';
import fireEventNode from './nodes/fire-event';
import getEntitiesNode from './nodes/get-entities';
import getHistoryNode from './nodes/get-history';
import numberNode from './nodes/number';
import pollStateNode from './nodes/poll-state';
import renderTemplateNode from './nodes/render-template';
import selectNode from './nodes/select';
import sensorNode from './nodes/sensor';
import sentenceNode from './nodes/sentence';
import switchNode from './nodes/switch';
import tagNode from './nodes/tag';
import textNode from './nodes/text';
import timeNode from './nodes/time';
import timeEntityNode from './nodes/time-entity';
import triggerStateNode from './nodes/trigger-state';
import updateConfigNode from './nodes/update-config';
import waitUntilNode from './nodes/wait-until';
import webhookNode from './nodes/webhook';
import zoneNode from './nodes/zone';
import { createRoutes } from './routes';

const nodes: Record<NodeType, any> = {
    [NodeType.API]: apiNode,
    [NodeType.Action]: actionNode,
    [NodeType.CurrentState]: currentStateNode,
    [NodeType.Device]: deviceNode,
    [NodeType.Entity]: entityNode,
    [NodeType.EventsAll]: eventsAllNode,
    [NodeType.EventsCalendar]: eventsCalendarNode,
    [NodeType.EventsState]: eventsStateNode,
    [NodeType.FireEvent]: fireEventNode,
    [NodeType.GetEntities]: getEntitiesNode,
    [NodeType.GetHistory]: getHistoryNode,
    [NodeType.PollState]: pollStateNode,
    [NodeType.RenderTemplate]: renderTemplateNode,
    [NodeType.Sentence]: sentenceNode,
    [NodeType.TriggerState]: triggerStateNode,
    [NodeType.Tag]: tagNode,
    [NodeType.Time]: timeNode,
    [NodeType.WaitUntil]: waitUntilNode,
    [NodeType.Webhook]: webhookNode,
    [NodeType.Zone]: zoneNode,

    // Config nodes
    [NodeType.Server]: configServerNode,
    [NodeType.DeviceConfig]: deviceConfigNode,
    [NodeType.EntityConfig]: entityConfigNode,

    // Entities
    [NodeType.BinarySensor]: binarySensorNode,
    [NodeType.Button]: buttonNode,
    [NodeType.Number]: numberNode,
    [NodeType.Select]: selectNode,
    [NodeType.Sensor]: sensorNode,
    [NodeType.Switch]: switchNode,
    [NodeType.Text]: textNode,
    [NodeType.TimeEntity]: timeEntityNode,
    [NodeType.UpdateConfig]: updateConfigNode,
};

export default async (RED: NodeAPI): Promise<void> => {
    setRED(RED);
    const storage = new Storage();
    await storage.init();
    setStorage(storage);
    setIssues(new IssueService());
    createRoutes();

    let type: NodeType;
    for (type in nodes) {
        RED.nodes.registerType(type, nodes[type], getExposedSettings(type));
    }
};
