<script>
    import {formatDate} from '../../../utils/format';
    import {dateFromString} from "../../../utils/date";

    export let date = new Date();
    export let prevDate = null;
    export let noDate = "";

    $: dateObj = date instanceof Date ? date : dateFromString(date);
    $: formatted = date ? formatDate(dateObj.toISOString()) : noDate;
    $: prevDateObj = prevDate ? (prevDate instanceof Date ? prevDate : dateFromString(date)) : null;
    $: prevFormatted = prevDate ? formatDate(prevDateObj.toISOString()) : "";
</script>

<style>
    small {display: block}
</style>
<span title={dateObj ? dateObj.toLocaleString() : ''}>{formatted}</span>{#if prevDateObj }<small title={prevDateObj.toLocaleString()}>{prevFormatted}</small>{/if}