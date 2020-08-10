import {writable} from "svelte/store";
import eventBus from '../../utils/broadcast-channel-pubsub';

let channels = {};
export const createChannelStore = (name, initialVal = null) => {
    if (channels[name]) return channels[name];

    const eventName = name + '.store';

    const { subscribe, set } = writable(initialVal);

    channels[name] = {
        subscribe,
        set: value => {
            set(value);
            eventBus.publish(eventName, value);
        }
    }

    eventBus.on(eventName, value => set(value));

    return channels[name];
}