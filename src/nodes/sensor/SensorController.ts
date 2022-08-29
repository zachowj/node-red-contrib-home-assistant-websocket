import SensorBaseController from '../../common/controllers/SensorBaseController';
import { SensorNode, SensorNodeProperties } from './index';

export default class SensorController extends SensorBaseController<
    SensorNode,
    SensorNodeProperties
> {}
