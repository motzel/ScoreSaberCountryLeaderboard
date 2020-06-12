export function hoverable(node) {
    function handleMouseover(event) {
        node.dispatchEvent(new CustomEvent('hover', {
            detail: { target: event.target, clientX: event.clientX, clientY: event.clientY, pageX: event.pageX, pageY: event.pageY }
        }));
    }

    function handleMouseout(event) {
        node.dispatchEvent(new CustomEvent('unhover', {
            detail: { target: event.target, clientX: event.clientX, clientY: event.clientY, pageX: event.pageX, pageY: event.pageY }
        }));
    }

    node.addEventListener('mouseover', handleMouseover);
    node.addEventListener('mouseout', handleMouseout);

    return {
        destroy() {
            node.removeEventListener('mouseover', handleMouseover);
            node.removeEventListener('mouseout', handleMouseout);
        }
    };
}