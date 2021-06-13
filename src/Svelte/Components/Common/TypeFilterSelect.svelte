<script>
    import {onMount} from 'svelte';
    import {_, trans} from '../../stores/i18n';
    import {getConfig} from "../../../plugin-config";

    import Select from '../Common/Select.svelte';

    export let value;
    export let country;

    let strings = {
        leaderboardTypes: [
            {id: 'all', _key: 'songLeaderboard.types.all'},
            {id: 'country', _key: 'songLeaderboard.types.country'},
            {id: 'country_and_friends', _key: 'songLeaderboard.types.country_and_friends'},
            {id: 'manually_added', _key: 'songLeaderboard.types.manually_added'},
        ],
    }
    let values = {
        leaderboardType: strings.leaderboardTypes.find(p => p.id === value)
    }

    let setDefaultType = false;
    if (!values.leaderboardType) {
        setDefaultType = true;
        values.leaderboardType = strings.leaderboardTypes.find(p => p.id === 'country');
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

    onMount(async () => {
        const config = await getConfig('songLeaderboard');

        if (setDefaultType && config.defaultType) {
            values.leaderboardType = strings.leaderboardTypes.find(t => t.id === config.defaultType);
        }

        if (!country && ['country', 'country_and_friends'].includes(values.leaderboardType.id)) {
            values.leaderboardType = strings.leaderboardTypes.find(t => t.id === 'all');
        }
    });

    $: value = values.leaderboardType.id;

    $: {
        translateAllStrings($_);
    }
</script>

<Select bind:value={values.leaderboardType} items={strings.leaderboardTypes} />