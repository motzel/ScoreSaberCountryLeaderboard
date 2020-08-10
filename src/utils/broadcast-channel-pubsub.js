let bc;

const createPubSub = () => {
    const subscribers = {}
    if (!bc) bc = new BroadcastChannel('global-pub-sub');

    const exists = eventName => Array.isArray(subscribers[eventName]);

    const notify = (eventName, value, _local = true) => {
        if (!exists(eventName)) return;

        subscribers[eventName].forEach(handler => handler(value, _local, eventName));
    }

    bc.onmessage = ({data: {eventName, value}}) => notify(eventName, value, false)

    return {
        on(eventName, handler) {
            if (!exists(eventName)) subscribers[eventName] = [];

            subscribers[eventName].push(handler);
        },
        unsubscribe(eventName, handler) {
            if (!exists(eventName)) return;

            subscribers[eventName] = subscribers[eventName].filter(h => h !== handler);
        },
        publish(eventName, value) {
            notify(eventName, value);

            bc.postMessage({eventName, value})
        }
    }
}

const pubSub = createPubSub();

export default pubSub;