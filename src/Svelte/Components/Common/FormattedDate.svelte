<script>
    import {formatDateRelative, formatDate} from '../../../utils/format';
    import {dateFromString} from "../../../utils/date";

    export let date = new Date();
    export let prevDate = null;
    export let noDate = "";

    $: dateObj = date instanceof Date ? date : dateFromString(date);
    $: formatted = date ? formatDateRelative(dateObj.toISOString()) : noDate;
    $: prevDateObj = prevDate ? (prevDate instanceof Date ? prevDate : dateFromString(date)) : null;
    $: prevFormatted = prevDate ? formatDateRelative(prevDateObj.toISOString()) : "";
</script>

<style>
    small {display: block}
</style>
<span title={dateObj ? formatDate(dateObj) : ''}>{formatted}</span>{#if prevDateObj }<small title={formatDate(prevDateObj)}>{prevFormatted}</small>{/if}