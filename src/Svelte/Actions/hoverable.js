export function hoverable(node) {
    function handleMouseover(event) {
        node.dispatchEvent(new CustomEvent('hover', {
            detail: { clientX: event.clientX, clientY: event.clientY, pageX: event.pageX, pagetY: event.pageY }
        }));
    }

    function handleMouseout(event) {
        node.dispatchEvent(new CustomEvent('unhover', {
            detail: { clientX: event.clientX, clientY: event.clientY, pageX: event.pageX, pagetY: event.pageY }
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