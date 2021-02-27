export default {
    profile: {
        settings: {
            header: 'Ustawienia',
            language: 'Język',
            locale: 'Lokalizacja',
            theme: 'Motyw',
            songBrowser: {
                header: 'Przeglądarka nut',
                autoTransform: 'Automatycznie transformuj',
                defaultTypeHeader: 'Domyślny rodzaj',
                defaultViewHeader: 'Domyślny widok',
                defaultColumnsHeader: 'Domyślne kolumny',
                defaultSortHeader: 'Domyślne sortowanie',
                defaultIconsHeader: 'Domyślne ikony',
                defaultItemsPerPageHeader: 'Liczba pozycji na stronę',
            },

            profile: {
                header: 'Profil',
                defaultChart: 'Domyślny wykres',
                statsStyling: 'Typ statystyk',
                showOnePpCalc: 'Pokazuj kalkulator +1PP',
                showTwitchIcon: 'Pokazuj przycisk Twitch',
                statsStyleBadge: 'Emblematy',
                statsStyleText: 'Tekst',
            },

            songLeaderboard: {
                header: 'Ranking nutki',
                showDiff: 'Pokazuj różnice',
                showWhatIfPp: 'Pokazuj przycisk "jeśli tak zagrasz"',
                showBgCover: 'Pokazuj okładkę w tle',
                defaultType: 'Domyślny typ',
            },

            others: {
                header: 'Inne',
                bgDownload: 'Pobieraj w tle',
                refreshHeader: 'Odświeżanie danych',
                keepView: 'Utrzymuj widok',
                alwaysRefresh: 'Zawsze odświeżaj',
            },

            export: 'Eksport',
            import: 'Import',
        },
        addPlayer: 'Dodaj gracza',
        setAsDefault: 'Ustaw jako Twój profil',
        addToFriends: 'Dodaj do Przyjaciół',
        removeFromFriends: 'Usuń z Przyjaciół',
        removePlayer: 'Usuń gracza',
        rawNewPlay: 'pp w nowej grze',
        onePpParseError: 'Wpisz może jakąś liczbę, ok? ${num1} jest liczbą, czy ${num2} jest. Ale "${str}"?',
        stats: {
            ranking: 'Ranking',
            pp: 'Punkty',
            playCount: 'Liczba gier',
            totalScore: 'Wynik razem',
            replays: 'Powtórki obejrzane przez innych',
            replaysShort: 'Powtorki',
            role: 'Rola',
            inactiveAccount: 'Konto nieaktywne',
            rankedPlayCount: 'Liczba zagranych rankedów',
            countryRank: 'Pozycja na krajowych leaderboardach',
            best: 'Naj.',
            avg: 'Śr.',
            totalRankedScore: 'Wynik rankedów razem',
            avgRankedAccuracy: 'Średnia celność rankedów',
            medianRankedAccuracy: 'Mediana celności rankedów',
            stdDeviationRankedAccuracy: 'Odchylenie stand. celności rankedów',
            avgRankedAccuracyShort: 'Średnia',
            medianRankedAccuracyShort: 'Mediana',
            stdDeviationRankedAccuracyShort: 'Odchylenie std',
        },
        twitch: {
            link: 'Połącz',
            linked: 'Połączono',
            renew: 'Odnów',
            daysLeft: 'Pozostało dni: ${days}',
            setupPlayerProfile: 'Ustaw profil Twitch',
            userNotFound: 'Użytkownik Twitcha nie znaleziony',
            vodsBadge: 'Twitch VOD',
            video: 'Wideo',
        },
        aside: {
            globalRanking: 'Ranking globalny',
            countryRanking: 'Ranking krajowy',
            whatToPlay: 'Co zagrać?',
        },
        whatToPlay: {
            all: 'Wszystkie',
            notPlayed: 'Niezagrane',
            toImprove: 'Do poprawy',
            algorithmBy: 'Algorytm szacowania dokładności opracowany przez'
        },
    },
    songBrowser: {
        types: {
            all: 'Wszystkie',
            ranked_only: 'Tylko rankingowe',
            unranked_only: 'Tylko nierankingowe',
            not_played_only: 'Tylko niezagrane',
            sniper_mode: 'Tryb snipera'
        },
        typesOptions: {
            all: 'Wszystkie',
            not_best: 'Gdy NIEnajlepszy',
            best: 'Gdy NAJlepszy',
        },
        viewTypes: {
            compact: 'Kompaktowy',
            tabular: 'Tabelaryczny',
            cards: 'Karty',
        },
        fields: {
            timeset: 'Data zagrania',
            timesetShort: 'Data',
            rank: 'Rank',
            rankShort: '#',
            stars: 'Gwiazdki',
            starsShort: '*',
            pp: 'PP',
            ppShort: 'PP',
            estimatedPp: 'Szac. PP',
            estimatedPpShort: 'Szac. PP',
            acc: 'Celność',
            accShort: 'Cel.',
            percentage: 'Procent',
            percentageShort: '%',
            estimatedAcc: 'Szac. celność',
            estimatedAccShort: 'Szac. cel.',
            maxPp: 'Max PP',
            maxPpShort: 'Max PP',
            bpm: 'BPM',
            bpmShort: 'BPM',
            njs: 'NJS',
            njsShort: 'NJS',
            nps: 'NPS',
            npsShort: 'NPS',
            duration: 'Czas',
            durationShort: 'Czas',
            diffPp: '+PP global',
            diffPpShort: '+PP',
            weighted: 'Ważone:',
            weightedPp: 'Ważone PP',
            weightedPpShort: 'wPP',
            score: 'Wynik',
            scoreShort: 'Wynik',
            diff: 'Różnice',
            diffShort: 'Różnice',
            icons: 'Ikony akcji',
            iconsShort: 'Ikony'
        },
        sort: {
            ascending: 'Rosnąco',
            descending: 'Malejąco',
        },
        icons: {
            bsr: '!bsr',
            beatsaver: 'Beat Saver',
            oneclick: 'OneClick Install',
            preview: 'Podgląd mapy',
            twitch: 'Twitch',
            bsrTooltip: 'Skopiuj !bsr',
            beatSaverTooltip: 'Przejdź na Beat Saver',
            twitchTooltip: 'Podgląd VOD',
        },
        typeHeader: 'Rodzaj',
        songHeader: 'Nutka',
        songPlaceholder: 'Zacznij wpisywać...',
        countryRankHeader: 'Pozycja w kraju',
        viewHeader: 'Widok',
        showHeader: 'Pokazuj',
        sortingHeader: 'Sortowanie',
        compare: {
            label: 'Porównaj',
            add: 'Dodaj gracza do porównania',
            remove: 'Usuń z porównania',
            saveAsDefault: 'Zapisz porównanie jako domyślne'
        },
        playlist: {
            label: 'Playlista',
            showChecks: 'Pokaż checkboksy',
            hideChecks: 'Ukryj checkboksy',
            checkAll: 'Zaznacz wszystkie',
            checkPage: 'Zaznacz stronę',
            clear: 'Wyczyść',
            export: 'Eksportuj playlistę'
        },
        csv: {
            label: 'CSV',
            export: 'Eksport do CSV',
        },
        transformingTheUniverse: 'Transformacja wszechświata w toku...',
        noData: {
            title: 'Strasznie tu pusto',
            info: 'Wygląda na to, że żadna nutka nie spełnia wszystkich wybranych wymagań. Zmień coś może?',
        },
        noScore: 'Brak wyniku',
        former: 'Poprzednio',
        totalPp: 'Razem dla ${name}',
        rankOfDate: 'Pozycja z dnia ${date}, kliknij aby odświeżyć',
        ssScoreType: {
            top: 'Najlepsze',
            recent: 'Ostatnie',
        },
        estimated: 'Szacunkowo',
        estimatedShort: 'Szac.',
    },
    songLeaderboard: {
        player: 'Gracz',
        mods: 'Mody',
        nobodyPlayed: 'Wygląda na to, że nikt jeszcze nie zagrał tej nutki.',
        searching: 'Wyszukiwanie wyników...',
        ranked: 'Rankingowa',
        unranked: 'Nierankingowa',
        maxPpSuffix: 'pp maks.',
        types: {
            all: 'Wszyscy',
            country: 'Tylko kraj',
            manually_added: 'Przyjaciele',
        },
        difficultyGraph: 'Difficulty graph',
    },
    songCard: {
        scores: 'Wyniki',
        notes: 'Klocki',
        bombs: 'Bomby',
        obstacles: 'Przeszkody',
    },
    refresh: {
        lastDownload: 'Pobrano:',
        rankedsDownload: 'Pobieranie aktualnych rankedów',
        countryPlayersDownload: 'Pobieranie aktywnych graczy',
        waiting: '[Czekam ${seconds}s]',
        error: 'Błąd pobierania danych. Spróbuj ponownie.',
        btnDisabledBgDlInProgress: 'Odświeżanie wyłączone. Trwa pobieranie w tle...',
    },
    whatif: {
        label: 'Jeśli tak zagrasz:',
    },
    dashboard: {
        rankingHeader: 'Ranking',
        showOriginal: 'Pokaż oryginał',
        lastScores: 'Ostatnie wyniki',
        bestScores: 'Najlepsze wyniki',
        ranking: {
            header: {
                player: 'Gracz',
                song: 'Nuta',
                timeset: 'Data',
                acc: '%',
                pp: 'PP',
                change: 'Różnica',
            },
            changeOptions: {
                day: 'Dzień',
                week: 'Tydzień',
                month: 'Miesiąc',
            },
        },
        periods: {
            last3Days: 'Ostatnie 3 dni',
            lastWeek: 'Ostatni tydzień',
            last2Weeks: 'Ostatnie 2 tygodnie',
            lastMonth: 'Ostatni miesiąc',
            last3Months: 'Ostatnie 3 miesiące',
            lastHalfYear: 'Ostatnie pół roku',
            lastYear: 'Ostatni rok',
            all: 'Wszystkie',
        },
        setCurrentCountry: 'Ustaw jako aktualny kraj',
        areYouSureSetCurrentCountry: 'Czy na pewno chcesz ustawić ${country} jako bieżący kraj?',
        areYouSureChangeCurrentCountry: 'Czy na pewno chcesz zmienić kraj z ${currentCountry} na ${country}?',
        onboardingLine1: 'Musimy teraz pobrać wszystkie wyniki graczy z wybranego kraju.',
        onboardingLine2: 'Usiądź sobie wygodnie, kliknij Start i poczekaj, bo trochę to potrwa...',
    },
    chart: {
        timeLabel: 'Czas',
        rankLabel: 'Pozycja',
        ppLabel: 'PP',
        activityLabel: 'Aktywność',
        rankTooltip: '#${value}',
        ppTooltip: '${value}pp',
        activityTooltip: 'Aktywność: ${value} (nutki)',
        starsLabel: 'Gwiazdki',
        accuracyLabel: 'Celność',
        accTooltip: 'Celność: ${acc}% (${mods}) | Gwiazdki: ${stars}*',
        percentageTooltip: 'Procent: ${acc}% (${mods}) | Gwiazdki: ${stars}*',
        accTooltipNoMods: 'Celność: ${acc}% | Gwiazdki: ${stars}*',
        percentageTooltipNoMods: 'Procent: ${acc}% | Gwiazdki: ${stars}*',
        rankingButton: 'Ranking',
        accuracyButton: 'Celność',
        percentageButton: 'Procent',
        none: 'Wyłączony'
    },
    beatSaviorImporter: {
        beatSaviorBtn: 'Beat Savior',
        header: 'Import danych Beat Savior',
        importBtn: 'Importuj',
        selectOtherFolderBtn: 'Wybierz inny folder',
        introduction: 'To narzędzie pozwala na zaimportowanie danych z moda <a href="https://www.beatsavior.io/" target="_blank" rel="noopener">BeatSavior</a> przechowywanych <strong>na Twoim komputerze</strong>. Narzędzie korzysta z nowego API File System Access, wymagana jest przeglądarka Chrome/Edge w wersji co najmniej 86.',
        selectFolder: 'Przy pierwszym imporcie będziesz musiał wskazać folder, w którym przechowywane są dane. Wybierz folder <strong>C:\\Users\\&lt;YOUR WINDOWS USER&gt;\\AppData\\Roaming\\Beat Savior Data</strong>',
        permissions: 'Przeglądarka poprosi Cię o potwierdzenie, że udzielasz zgody do odczytu lokalnych plików, udziel jej. To potwierdzenie będzie konieczne podczas każdej nowej sesji (po zamknięciu zakładki lub przeładowaniu strony).',
        importInProgress: 'Importowanie danych. Proszę czekać...',
        importCompleted: 'Dane zostały zaimportowane',
        fileSystemApiNotAvailableException: 'API File System Access nie jest dostępne',
        noFolderSelectedException: 'Nie wybrano folderu',
        noDirectoryHandleException: 'Nie udało się pobrać uchwytu katalogu',
        noPermissionException: 'Nie udzielono zgody na odczyt lokalnych plików',
        oldPlayerScoresException: 'Proszę odświeżyć wyniki. Nie mogą być starsze niż 5 minut.',
        skipping: 'pomijam',
        loading: 'wczytywanie',
        fetchPlayerScores: 'pobieranie wyników gracza',
        savingToDb: 'zapisywanie',
    },
    beatSavior: {
        left: 'Lewa',
        leftShort: 'L',
        right: 'Prawa',
        rightShort: 'P',
        accLeft: 'Celność lewej',
        accLeftShort: 'Cel. L',
        accRight: 'Celność prawej',
        accRightShort: 'Cel. P',
        avgAcc: 'Średnia celność',
        avgAccShort: 'Śr. cel.',
        beforeCut: 'Cięcie przed',
        beforeCutShort: 'Przed',
        afterCut: 'Cięcie po',
        afterCutShort: 'Po',
        accuracy: 'Celność',
        accuracyShort: 'Cel.',
        misses: 'Pudła',
        missesShort: 'Pudła',
        maxCombo: 'Maks combo',
        maxComboShort: 'Combo',
        pauses: 'Pauzy',
        pausesShort: 'Pauzy',
        bombHit: 'Trafienie bomby',
        bombHitShort: 'Bomby',
        wallHit: 'Trafienie ściany',
        wallHitShort: 'Ściany',
    },
    themes: {
        dark: 'Jedyny słuszny',
        light: 'Wypalający oczy',
        drakonno: 'Drakonno',
        sombra: 'Sombra'
    },
    plugin: {
        cachedButton: 'Cache',
        liveButton: 'Live',
    },
    common: {
        ok: 'OK',
        save: 'Zapisz',
        cancel: 'Anuluj',
        close: 'Zamknij',
        options: 'Opcje',
        search: 'Szukaj',
        nothingSelected: 'Nic nie wybrano',
        to: 'do',
        noData: 'Brak danych',
        downloadError: 'Błąd pobierania',
    },
    import: {
        selectJsonFile: 'Wybierz plik JSON zawierający eksport danych',
        oldVerNotSupported: 'Import pliku ze starszej wersji pluginu nie jest wspierany',
        incorrectFile: 'Niepoprawny plik eksportu',
        incorrectJsonFile: 'Niepoprawny plik JSON'
    },
    db: {
        conversionMessage: 'Konwersja bazy danych',
        conversionSecondaryMessage: 'Proszę czekać, nie powinno to zająć dłużej niż pół minuty...',
    },
    onboarding: {
        importOrSetProfile: "Zaimportuj dane lub ustaw jako swój profil"
    }
}