export default () => {
    let queue = [];

    const isEmpty = () => !queue.length;

    const clear = () => {queue = []}

    const add = (item, label = '', priority = 1, then = null, metadata = null) => {
        queue = queue.concat([{item, label, priority, then, metadata}]).sort((a, b) => b.priority - a.priority)

        return queue.length;
    }

    const next = () => queue.length ? queue.shift() : null;

    const contains = label => !!queue.find(item => item.label === label)

    return {
        isEmpty,
        size: () => queue.length,
        clear,
        add,
        next,
        contains,
    }
}