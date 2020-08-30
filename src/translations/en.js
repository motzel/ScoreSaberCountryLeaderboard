export default {
    profile: {
        settings: {
            header: 'Settings',
            language: 'Language',
            locale: 'Localization',
            theme: 'Theme',
            songBrowser: {
                header: 'Song browser',
                autoTransform: 'Automatically transform',
                defaultTypeHeader: 'Default type',
                defaultViewHeader: 'Default view',
                defaultColumnsHeader: 'Default columns',
                defaultSortHeader: 'Default sort',
                defaultIconsHeader: 'Default icons',
                defaultItemsPerPageHeader: 'Number of items per page',
            },

            profile: {
                header: 'Profile',
                enlargeAvatar: 'Enlarge avatar',
                showChart: 'Show the chart',
                showOnePpCalc: 'Show +1PP calculator'
            },

            songLeaderboard: {
                header: 'Song ranking',
                showDiff: 'Show the differences',
                showWhatIfPp: 'Show the "What if you play it like that" button',
                showBgCover: 'Show background cover',
            },

            defaultSongList: {
                header: 'Default song list',
                enhance: 'Add scores/accuracy',
                showDiff: 'Show the differences',
            },

            others: {
                header: 'Others',
                bgDownload: 'Background download',
                keepView: 'Keep the view',
                alwaysRefresh: 'Always refresh',
            },
            export: 'Export',
            import: 'Import',
        },
        addPlayer: 'Add player',
        setAsDefault: 'Set as your profile',
        removePlayer: 'Remove player',
    },
    songBrowser: {
        types: {
            all: 'All',
            ranked_only: 'Ranked only',
            unranked_only: 'Unranked only',
            not_played_only: 'Not played only',
            sniper_mode: 'Sniper mode'
        },
        typesOptions: {
            all: 'All',
            not_best: 'When NOT the best',
            best: 'When THE best',
        },
        viewTypes: {
            compact: 'Compact',
            tabular: 'Tabular'
        },
        fields: {
            timeset: 'Date of play',
            timesetShort: 'Date',
            stars: 'Stars',
            starsShort: '*',
            pp: 'PP',
            ppShort: 'PP',
            acc: 'Accuracy',
            accShort: 'Acc',
            maxPp: 'Max PP',
            maxPpShort: 'Max PP',
            bpm: 'BPM',
            bpmShort: 'BPM',
            njs: 'NJS',
            njsShort: 'NJS',
            nps: 'NPS',
            npsShort: 'NPS',
            duration: 'Duration',
            durationShort: 'Time',
            diffPp: '+PP global',
            diffPpShort: '+PP',
            weighted: 'Weighted:',
            weightedPp: 'Weighted PP',
            weightedPpShort: 'w.PP',
            score: 'Score',
            scoreShort: 'Score',
            diff: 'Differences',
            diffShort: 'Diff',
            icons: 'Action icons',
            iconsShort: 'Icons',
        },
        sort: {
            ascending: 'Ascending',
            descending: 'Descending',
        },
        icons: {
            bsr: '!bsr',
            beatsaver: 'Beat Saver',
            oneclick: 'OneClick Install',
            preview: 'Map preview',
            twitch: 'Twitch',
            bsrTooltip: 'Copy !bsr',
            beatSaverTooltip: 'Go to Beat Saver',
            twitchTooltip: 'VOD preview',
        },
        typeHeader: 'Type',
        songHeader: 'Song',
        songPlaceholder: 'Start typing...',
        viewHeader: 'View',
        showHeader: 'Show',
        sortingHeader: 'Sorting',
        compare: {
            label: 'Compare',
            add: 'Add a player to compare',
            remove: 'Remove from comparision',
            saveAsDefault: 'Save as default'
        },
        playlist: {
            label: 'Playlist',
            showChecks: 'Show checkboxes',
            hideChecks: 'Hide checkboxes',
            checkAll: 'Check all',
            checkPage: 'Check the page',
            clear: 'Clear',
            export: 'Export playlist'
        },
        csv: {
            label: 'CSV',
            export: 'Export CSV',
        },
        transformingTheUniverse: 'Transformation of the universe in progress...',
        noData: {
            title: 'It\'s so empty here.',
            info: 'It seems that no song meets all the selected requirements. Change something maybe?',
        }
    },
    songLeaderboard: {
        player: 'Player',
        mods: 'Mods',
        nobodyPlayed: 'It seems that nobody has played this song yet.',
        searching: 'Searching for results...',
    },
    refresh: {
        lastDownload: 'Downloaded:',
        rankedsDownload: 'Downloading current rankeds',
        countryPlayersDownload: 'Downloading the top 50 ${country}...',
        waiting: '[Waiting ${seconds}s]',
        error: 'Download error. Try again.',
    },
    whatif: {
        label: 'If you play like this:',
    },
    dashboard: {
        rankingHeader: 'Ranking',
        showOriginal: 'Show the original',
        lastScores: 'Recent scores',
        bestScores: 'Best scores',
        ranking: {
            header: {
                player: 'Player',
                song: 'Song',
                timeset: 'Date',
                acc: 'Acc',
                pp: 'PP',
                change: 'Change',
            },
            changeOptions: {
                day: 'Daily change',
                week: 'Weekly change',
                month: 'Monthly change',
            },
        },
        periods: {
            last3Days: 'Last 3 days',
            lastWeek: 'Last week',
            last2Weeks: 'Last 2 weeks',
            lastMonth: 'Last month',
        },
    },
    chart: {
        timeLabel: 'Time',
        rankLabel: 'Rank',
        rankTooltip: 'Rank ${rank}',
        starsLabel: 'Stars',
        accuracyLabel: 'Accuracy',
        accTooltip: 'Accuracy: ${acc}% | Stars: ${stars}*',
        rankingButton: 'Ranking',
        accuracyButton: 'Accuracy',
    },
    themes: {
        dark: 'One and the only',
        light: 'Eyes burning',
        drakonno: "Drakonno's",
        sombra: "Sombra's"
    },
    common: {
        save: 'Save',
        cancel: 'Cancel',
        options: 'Options',
        nothingSelected: 'Nothing selected',
        to: 'to',
    }
}