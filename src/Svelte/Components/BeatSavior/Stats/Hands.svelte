<script>
  import HandAcc from '../HandAcc.svelte'

  export let data = null;
</script>

{#if data}
  <div class="acc">
    <HandAcc value={data.accLeft} cut={data.leftAverageCut} color={data.saberAColor} hand="left"/>
    <HandAcc value={data.accRight} cut={data.rightAverageCut} color={data.saberBColor} hand="right"/>
  </div>
{/if}

<style>
    .acc {
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
    }
</style>