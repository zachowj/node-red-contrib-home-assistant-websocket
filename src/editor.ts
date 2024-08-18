import { EditorRED } from 'node-red';

import { NodeType, PRINT_TO_DEBUG_TOPIC } from './const';
import {
    updateAreas,
    updateDevices,
    updateEntities,
    updateEntity,
    updateEntityRegistry,
    updateFloors,
    updateLabels,
    updateServices,
} from './editor/data';
import { setupEditors } from './editor/editors';
import { updateIntegration } from './editor/exposenode';
import { printToDebugPanel } from './editor/print-to-debug';
import { initSidebar } from './editor/sidebar';
import {
    onNodesAdd,
    onNodesRemove,
    setupMigrations,
    versionCheck,
} from './editor/version';
import ActionEditor from './nodes/action/editor';
import ApiEditor from './nodes/api/editor';
import BinarySensorEditor from './nodes/binary-sensor/editor';
import ButtonEditor from './nodes/button/editor';
import ConfigServerEditor from './nodes/config-server/editor';
import CurrentStateEditor from './nodes/current-state/editor';
import DeviceEditor from './nodes/device/editor';
import DeviceConfigEditor from './nodes/device-config/editor';
import EntityEditor from './nodes/entity/editor';
import EntityConfigEditor from './nodes/entity-config/editor/editor';
import EventsAllEditor from './nodes/events-all/editor';
import EventsCalendarEditor from './nodes/events-calendar/editor';
import EventsStateEditor from './nodes/events-state/editor';
import FireEventEditor from './nodes/fire-event/editor';
import GetEntitiesEditor from './nodes/get-entities/editor';
import GetHistoryEditor from './nodes/get-history/editor';
import NumberEditor from './nodes/number/editor';
import PollStateEditor from './nodes/poll-state/editor';
import RenderTemplateEditor from './nodes/render-template/editor';
import SelectEditor from './nodes/select/editor';
import SensorEditor from './nodes/sensor/editor';
import SentenceEditor from './nodes/sentence/editor';
import SwitchEditor from './nodes/switch/editor';
import TagEditor from './nodes/tag/editor';
import TextEditor from './nodes/text/editor';
import TimeEditor from './nodes/time/editor';
import TimeEntityEditor from './nodes/time-entity/editor';
import TriggerStateEditor from './nodes/trigger-state/editor';
import UpdateConfigEditor from './nodes/update-config/editor';
import WaitUntilEditor from './nodes/wait-until/editor';
import WebhookEditor from './nodes/webhook/editor';
import ZoneEditor from './nodes/zone/editor';

declare const RED: EditorRED;

RED.comms.subscribe('homeassistant/areas/#', updateAreas);
RED.comms.subscribe('homeassistant/devices/#', updateDevices);
RED.comms.subscribe('homeassistant/entity/#', updateEntity);
RED.comms.subscribe('homeassistant/entities/#', updateEntities);
RED.comms.subscribe('homeassistant/floors/#', updateFloors);
RED.comms.subscribe('homeassistant/labels/#', updateLabels);
RED.comms.subscribe('homeassistant/integration/#', updateIntegration);
RED.comms.subscribe('homeassistant/services/#', updateServices);
RED.comms.subscribe('homeassistant/entityRegistry/#', updateEntityRegistry);
RED.comms.subscribe(PRINT_TO_DEBUG_TOPIC, printToDebugPanel);
setupMigrations();
setupEditors();
RED.events.on('nodes:add', onNodesAdd);
RED.events.on('nodes:remove', onNodesRemove);
RED.events.on('editor:open', versionCheck);
RED.events.on('runtime-state', initSidebar);

// config nodes
RED.nodes.registerType(NodeType.DeviceConfig, DeviceConfigEditor);
RED.nodes.registerType(NodeType.EntityConfig, EntityConfigEditor);
RED.nodes.registerType(NodeType.Server, ConfigServerEditor);

// general nodes
RED.nodes.registerType(NodeType.API, ApiEditor);
RED.nodes.registerType(NodeType.Action, ActionEditor);
RED.nodes.registerType(NodeType.CurrentState, CurrentStateEditor);
RED.nodes.registerType(NodeType.Device, DeviceEditor);
RED.nodes.registerType(NodeType.Entity, EntityEditor);
RED.nodes.registerType(NodeType.EventsAll, EventsAllEditor);
RED.nodes.registerType(NodeType.EventsCalendar, EventsCalendarEditor);
RED.nodes.registerType(NodeType.EventsState, EventsStateEditor);
RED.nodes.registerType(NodeType.FireEvent, FireEventEditor);
RED.nodes.registerType(NodeType.GetEntities, GetEntitiesEditor);
RED.nodes.registerType(NodeType.GetHistory, GetHistoryEditor);
RED.nodes.registerType(NodeType.PollState, PollStateEditor);
RED.nodes.registerType(NodeType.RenderTemplate, RenderTemplateEditor);
RED.nodes.registerType(NodeType.Sentence, SentenceEditor);
RED.nodes.registerType(NodeType.Tag, TagEditor);
RED.nodes.registerType(NodeType.Time, TimeEditor);
RED.nodes.registerType(NodeType.TriggerState, TriggerStateEditor);
RED.nodes.registerType(NodeType.WaitUntil, WaitUntilEditor);
RED.nodes.registerType(NodeType.Webhook, WebhookEditor);
RED.nodes.registerType(NodeType.Zone, ZoneEditor);

// entities nodes
RED.nodes.registerType(NodeType.BinarySensor, BinarySensorEditor);
RED.nodes.registerType(NodeType.Button, ButtonEditor);
RED.nodes.registerType(NodeType.Number, NumberEditor);
RED.nodes.registerType(NodeType.Select, SelectEditor);
RED.nodes.registerType(NodeType.Sensor, SensorEditor);
RED.nodes.registerType(NodeType.Switch, SwitchEditor);
RED.nodes.registerType(NodeType.Text, TextEditor);
RED.nodes.registerType(NodeType.TimeEntity, TimeEntityEditor);
RED.nodes.registerType(NodeType.UpdateConfig, UpdateConfigEditor);
