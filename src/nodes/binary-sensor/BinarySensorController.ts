import SensorBaseController from '../../common/controllers/SensorBaseController';
import { BinarySensorNode, BinarySensorNodeProperties } from './index';

export default class BinarySensorController extends SensorBaseController<
    BinarySensorNode,
    BinarySensorNodeProperties
> {}
