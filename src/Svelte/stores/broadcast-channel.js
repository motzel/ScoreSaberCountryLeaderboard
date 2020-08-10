import {writable} from "svelte/store";

let channels = {};
export const createChannelStore = (name, initialVal = null) => {
    if (channels[name]) return channels[name];


    const bc = new BroadcastChannel(name);

    const { subscribe, set } = writable(initialVal);

    channels[name] = {
        subscribe,
        bc,
        set: value => {
            set(value);
            bc.postMessage(value)
        }
    }

    bc.onmessage = e => set(e.data);

    return channels[name];
}