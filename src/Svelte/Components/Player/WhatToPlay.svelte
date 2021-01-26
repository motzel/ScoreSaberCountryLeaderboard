<script>
  import {onMount, createEventDispatcher} from 'svelte'
  const dispatch = createEventDispatcher();

  import {_, trans} from '../../stores/i18n';
  import {getRankedSongs} from '../../../scoresaber/rankeds'
  import balibalo from '../../../scoresaber/balibalo';
  import eventBus from '../../../utils/broadcast-channel-pubsub'
  import Song from '../Song/Song.svelte'
  import Difficulty from '../Common/Difficulty.svelte'
  import Value from '../Common/Value.svelte'
  import Pager from '../Common/Pager.svelte'
  import Switcher from '../Common/Switcher.svelte'

  export let playerScores = [];

  let allRankeds = {};
  let estimator = null;

  let estimatedScores = null
  let results = null;

  let currentPage = 0;
  let itemsPerPage = 5;

  let strings = {
    switches: [
      {_key: 'profile.whatToPlay.all', id: 'all'},
      {_key: 'profile.whatToPlay.notPlayed', id: 'not-played'},
      {_key: 'profile.whatToPlay.toImprove', id: 'to-improve'},
    ],
  }

  let values = {
    type: strings.switches[0],
  }

  function translateAllStrings() {
    Object.keys(strings).forEach(key => {
      strings[key].forEach(item => {
        if (item._key) item.label = trans(item._key);
      })
    })

    strings = {...strings};
    values = {...values};
  }

  let initialized = true;

  async function refreshRankeds() {
    allRankeds = await getRankedSongs();
  }

  function refreshPage(estimatedScores, type) {
    if (!estimatedScores || !type || !type.id) return;

    switch (type.id) {
      case 'not-played':
        results = estimatedScores.filter(s => !s.pp);
        break;

      case 'to-improve':
        results = estimatedScores.filter(s => s.pp);
        break;

      case 'all':
      default:
        results = estimatedScores;
        break;
    }

    currentPage = 0;
  }

  async function refreshPlayerScores(estimator, playerScores, allRankeds) {
    if (!estimator || !initialized) return;

    if (estimator.init(playerScores, allRankeds)) {
      const estimated = estimator.estimate();

      estimatedScores = estimated.scores
        .filter(s => !s.pp || s.pp < s.estimatedPp)
        .map(s => ({
          leaderboardId: s.leaderboardId,
          hash: s.hash,
          diffInfo: s.diffInfo,
          name: s.name,
          songAuthor: s.songAuthor,
          levelAuthor: s.levelAuthor,
          stars: s.stars,
          estimatedAcc: s.estimatedAcc,
          estimatedPp: s.estimatedPp,
          acc: s.acc,
          pp: s.pp,
          ppDiff: s.ppDiff,
        }))
        .sort((a, b) => b.ppDiff - a.ppDiff);

      currentPage = 0;
    }
  }

  function onShowFull() {
    dispatch('show-full')
  }

  onMount(async () => {
    await refreshRankeds();

    estimator = balibalo();

    const rankedsUnsubscriber = eventBus.on('rankeds-changed', async () => await refreshRankeds());

    initialized = true;

    return () => {
      rankedsUnsubscriber();
    }
  });

  $: {
    refreshPlayerScores(estimator, playerScores, allRankeds, initialized);
  }

  $: {
    refreshPage(estimatedScores, values.type);
  }

  $: {
    translateAllStrings($_);
  }
</script>

{#if initialized && results}
  <div class="box has-shadow ranking">
    <header>
      <div>
        <i class="fas fa-play-circle"></i>
        <a on:click={onShowFull}>{$_.profile.aside.whatToPlay}</a>
      </div>

      <a on:click={onShowFull} class="show-full"><i class="fas fa-external-link-alt"></i></a>
    </header>

    <div class="switcher">
      <Switcher values={strings.switches} bind:value={values.type}/>
    </div>

    <div>
      {#if results.length}
        <table class="sspl">
          <tbody>
          {#each results.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) as song(song.leaderboardId)}
            <tr>
              <td>
                <div class="song">
                  <Song song={song}>
                    <figure>
                      <Difficulty diff={song.diffInfo} useShortName={true} reverseColors={true}/>

                      <div class="songinfo">
                        <span class="name">{song.name}</span>
                        <div class="author">{song.songAuthor} <small>{song.levelAuthor}</small>
                        </div>
                      </div>
                    </figure>
                  </Song>
                </div>

                <div class="values">
                  <div>
                    <i class="fa fa-crosshairs"></i>
                    <Value value={song.estimatedAcc} prevValue={song.acc} suffix="%" inline={true}/>
                  </div>

                  <div>
                    <i class="fa fa-table"></i>
                    <Value value={song.estimatedPp} prevValue={song.pp} suffix="pp" inline={true}/>
                  </div>

                  <div class="ppDiff">
                    <i class="fa fa-chart-line"></i>
                    <Value value={song.ppDiff} prefix="+" suffix="pp" inline={true}/>
                  </div>
                </div>

              </td>
            </tr>
          {/each}
          </tbody>
        </table>

        <Pager bind:currentPage totalItems={results.length} {itemsPerPage} itemsPerPageValues={null}
               mode="simple"/>

        <small class="balibalo">
          {$_.profile.whatToPlay.algorithmBy}
          <a href="https://github.com/BaliBalo/ScoreSaber" target="_blank" rel="noopener">BaliBalo</a>
        </small>
      {:else}
        <p>{$_.common.noData}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
    .box {
        padding: .5rem;
    }

    header {
        display: flex;
        justify-content: space-between;
        font-size: 1.1em;
        font-weight: 500;
        margin-bottom: .5em;
    }

    header a {
        color: inherit!important;
    }

    header > i {
        margin-right: .25em;
    }

    .switcher {
        padding: .5em 0;
    }

    table {
        width: 100%;
        font-size: 1em;
    }

    table tbody td {
        padding: 0.25em 0.25em;
        border-bottom: 1px solid var(--dimmed);
    }

    .song figure {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin: 0;
        line-height: 1.25;
    }

    .song img {
        flex: 0 1 40px;
        width: 40px;
        height: 40px;
        margin: 0 1em 0 .5em;
    }

    .song .songinfo {
        text-align: left;
        font-weight: 500;
        margin-left: .5em;
    }

    .song .songinfo {
        color: var(--alternate);
    }

    .song .songinfo small {
        font-size: 0.75em;
        color: var(--ppColour);
    }

    :global(.song figure .diff) {
        padding: .25em;
    }

    .values {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-top: .15em;
    }

    :global(.values > div > span) {
        font-weight: 500;
    }

    :global(.values small.inline) {
        margin-left: .2em;
    }

    .values .ppDiff {
        color: var(--ppColour);
    }

    .balibalo {
        display: block;
        margin-top: 1em;
        color: var(--dimmed);
        text-align: right;
    }

    .balibalo a {
        color: inherit !important;
        text-decoration: underline;
    }
</style>