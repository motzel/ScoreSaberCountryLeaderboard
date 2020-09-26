# ScoreSaber Country Leaderboard
Provides additional features to [ScoreSaber](https://scoresaber.com). See the feature list below.

# Userscript installation
Get Tampermonkey for [Chrome/Edge Chromium](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/). Then install the script from [here](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js).

# Quickstart

Go to your ScoreSaber profile page and click "Set as your profile". All your scores will be downloaded in a few minutes.

From your profile, you can also change the plugin settings by clicking the settings button (the little cog) under your profile image.

Then, depending on the selected mode:

- **Friends mode**: Go to the profile of each player you want to add and click "Add to Friends" button (star icon).

- **Country mode**: Go to the ranking page of your country and click "Set as the current country" button. The scores of the top 50 players from your country will be downloaded. Because the ScoreSaber API has a download limit of 640 scores (80 request, 8 scores each) per minute the whole process will take a long time, approximately 1 hour. However, this is a one-time process. Then only new scores will be downloaded, which will take less than a minute. Alternatively, if you have a friend who has already downloaded scores from your country, you can ask them to export the data from the plugin settings menu. In that case, all you have to do is import the file given to you by your friend (again via the plugin settings) and then press "Set as your profile" on your profile again.

- **Mixed mode**: You can also set your country and then add profiles of other players to add them to the mixed leaderboard.

**Warning: Do not clean your browser cache or add scoresaber.com to exceptions! The data is only stored on your computer, so if you do this you will have to download everything again.**

# Feature list

### Song country leaderboard
- A country leaderboard for the song
- Filtering by country or friends
- Song cover in the background
- Song statistics downloaded from Beat Saver 
- Copy !bsr to the clipboard
- View song on Beat Saver
- OneClick&trade; Install
- Map preview via [BS Viewer](https://skystudioapps.com/bs-viewer/)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/01_song_leaderboard.png)

### "If you play like this" widget
- Shows how much PP you would gain if you set the same score as another player

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/02_if_you_play.png)

### Your avatar and country in the navbar
- Quick access to your profile and country ranking (by clicking on either icon)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/03_avatar_in_navbar.png)


### Enhanced player profile
- Enlarged avatar
- Additional player stats
- 1pp boundary calculator - that is how much PP you have to get from a new play to get +1pp to the global ranking
- Ranked songs badges
- Enlarged, more readable chart
- New accuracy chart
 
![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/04_enhanced_profile.png)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/05_accuracy_chart.png) 

### Song browser
- Immediate, advanced filtering by the name of the song, song author and map author, type (ranked/unranked/unplayed rankeds) and number of stars.
- Quickly browse the next page without loading
- Customizable number of displayed songs per page
- Tabular, compact and card view
- Customizable song statistics - number of stars, maximum PP, duration, BPM, NPM, NJS, NPS
- Display accuracy even for unranked songs (if not removed from Beat Saver)
- Numerous list of available options for each song - copy !bsr, view on Beat Saber, OneClick&trade; Install, Map preview and Twitch preview (for a limited, fixed number of accounts at this point. Wait for the new version.)
- Display improvement of PPs, score and accuracy over time
- Comparing scores with other players
- Sorting by number of stars, play date, accuracy and PP; ascending and descending
- Displaying song leaderboard in place
- Sniper mode - automatic comparison of scores to other players (default one above you and one below you), which can increase your global PPs by at least 1pp. Displaying a summary of your global PPs if you get scores like other players in comparison.
- Generating playlists from filtered songs
- Data export to CSV (Excel)


![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/06_adv_filtering_1.png)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/06_adv_filtering_2.png)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/06_adv_filtering_3.png)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/07_sorting.png)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/08_metrics.png)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/09_types.png)

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/10_in_place_leaderboard.png)

### Redesigned country ranking
- Weekly PPs growths
- Recent scores of all players with in-place song leaderboard
- Best scores of all players with in-place song leaderboard

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/11_country_ranking.png)

### Settings
- Translation and localization
- Color themes
- Customizable default values
- Enable/disable individual enhancements
- Data export/import
- Refreshing data in the background or on demand

![](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/doc/12_settings.png)

# Changelog
You can find change log [here](CHANGELOG.md).

# Develop
- `npm install`
- `npm run dev`
- Copy the content of `./test/header.js` to the TamperMonkey script editor.

## Build
- `npm run build` 
