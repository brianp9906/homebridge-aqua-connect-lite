import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME, ACCESSORY_TYPE, ACCESSORIES } from './settings';
import { Light } from './light';
import { Switch } from './switch';

/**
 * HomebridgePlatform
 */
export class AquaConnectLitePlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

    public readonly accessories: PlatformAccessory[] = [];

    constructor(
        public readonly log: Logger,
        public readonly config: PlatformConfig,
        public readonly api: API) {
        this.log.debug('Finished initializing platform:', this.config.name);
        
        this.api.on('didFinishLaunching', () => {
            this.discoverDevices();
        });
    }

    configureAccessory(accessory: PlatformAccessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);

        if (!this.accessories.some(a => a.UUID === accessory.UUID)) {
            this.accessories.push(accessory);
        }
    }

    discoverDevices() {
        for (const accessory of ACCESSORIES) {
            // generate a unique id
            const uuid = this.api.hap.uuid.generate((PLATFORM_NAME + accessory.NAME + accessory.TYPE));

            const existingAccessory = this.accessories.find(a => a.UUID === uuid);

            if (existingAccessory) {
                // the accessory already exists
                this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
        
                this.api.updatePlatformAccessories([existingAccessory]);

                switch (accessory.TYPE) {
                    case ACCESSORY_TYPE.LIGHT:
                        new Light(this, existingAccessory);
                        break;
                    case ACCESSORY_TYPE.SWITCH:
                        new Switch(this, existingAccessory);
                        break;
                    default:
                        break;
                }
            } else {
                // the accessory does not yet exist, so we need to create it
                this.log.info('Adding new accessory:', accessory.NAME);
        
                // create a new accessory
                const newAccessory = new this.api.platformAccessory(accessory.NAME, uuid);

                newAccessory.context.device = accessory;

                switch (accessory.TYPE) {
                    case ACCESSORY_TYPE.LIGHT:
                        new Light(this, newAccessory);
                        break;
                    case ACCESSORY_TYPE.SWITCH:
                        new Switch(this, newAccessory);
                        break;
                    default:
                        break;
                }
        
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [newAccessory]);
            }  
        }            
    }
}
