# Changelog

[+] new function added
[-] function removed
[!] bug fix
[*] other changes

0.9.6
- [+] add support for countries other than Poland
- [+] add song leaderboard filtering by player type

0.9.5.2
- [+] add in-place leaderboard in Song Browser when Cards view is selected
- [*] optimize theme initialization

0.9.5.1
- [!] some minor bug fix regarding fragment part in url

0.9.5
- [+] add cards view to Song Browser
- [+] add i18n support

0.9.4.2
- [+] items in the accuracy chart are now clickable, thx Drakonno

0.9.4.1
- [!] some minor bug fixes

0.9.4
- [+] Add the accuracy chart, thx Modren

0.9.3.2
- [!] fixed visual bug with playlist editing in sniper mode

0.9.3.1
 - [!] fixed keep-view option in Song Browser
 
0.9.3
 - [+] background data downloading 
 
0.9.2.1
 - [!] SS API rate limit handling fix
 
0.9.2
 - [+] the possibility to manually add players to the plugin
 
0.9.1.10
 - [!] playlist bugfix, thx Drakonno
 
0.9.1.9
 - [!] playlist bugfix 
 
0.9.1.8
 - [+] playlist generator
 
0.9.1.7
 - [+] song stats and redesign song info box
 
0.9.1.6
 - [+] OneClick&trade; Install icon to song browser
 - [+] !bsr/Beat Saver/OneClick&trade; Install icons to song page
 
0.9.1.5
 - [*] SS API error handling optimization
 
0.9.1.4
 - [+] sort order option, thx Patian
 
0.9.1.3
 - [+] the best/not the best filter options in players comparision
 
0.9.1.2
 - [!] fix available sort options for each type in song browser 
 
0.9.1.1
 - [!] some minor bug fixes
 
0.9.1
 - [+] players comparision in song browser
 - [+] highlight current player on song leaderboard previewed from country dashboard
 - [!] some minor UI fixes
 
0.9.0.6
 - [+] refresh button to country dashboard
 
0.9.0.5
 - [!] fixed bug with current page in song browser when filtering narrowing down total count
 
0.9.0.4
 - [+] song leaderboard preview to top/last song on the country dashboard
 
0.9.0.3
 - [+] background cover to song leaderboard
 
0.9.0.2
 - [*] SSE workaround
 
0.9.0.1
 - [+] difficulty info to songs on country dashboard, thx Sombra
 
0.9
 - [+] new country ranking dashboard
 
0.8.9.8
 - [!] fix rank parsing, thx Sebanan
 
0.8.9.7
 - [!] fix !bsr copy to clipboard in Firefox, thx Drakonno 
 
0.8.9.6
 - [+] a rank to player profile that includes additional country players
 
0.8.9.5
 - [+] song leaderboard preview to song browser
 
0.8.9.4
 - [+] import data button if there is no data downloaded yet for faster onboarding

0.8.9.3
 - [!] fix theme settings when SS is set to light mode
 
0.8.9.2
 - [*] optimize SS API usage
 
0.8.9.1
 - [+] only unplayed ranked songs filter to song browser
 
0.8.9
 - [+] color theme support
 
0.8.8
 - [+] accuracy badges, thx Modren 
 
0.8.7.3
 - [!] small fix regarding downloading additional players avatars
 
0.8.7.2
 - [*] foreign polish players update
 
0.8.7.1 
 - [!] small fix regarding twitch button
 
0.8.7
 - [+] configuration window
 
0.8.6.1
 - [+] stars/accuracy => pp calculator to player profile page
 
0.8.6
 - [+] Beat Saver integration
 - [+] BS Viewer integration
 - [*] UI changes
 
0.8.5.2
 - [!] minor bug fix regarding player inactivity
 - [+] date to default export filename
 
0.8.5.1
 - [!] minor twitch integration fix regarding video offset
 
0.8.5
 - [+] twitch integration
 
0.8.4
 - [+] data export/import
 
0.8.3
 - [+] bpm/njs/nps suffixes are now not added in the tabular view
 
0.8.2
 - [+] song bpm, njs, nps and duration to song browser
 
0.8.1
 - [+] CSV export
 - [!] fix bug with acc calc on song leaderboard when mods were in use
 
0.8
 - [+] new song browser with advanced filtering
 - [!] fix bug when refreshing from player profile
 
0.7.7
 - [*] change the way the results are downloaded to maximise usage of the SS API rate limit
 - [+] 429 http status handling - reading the x-ratelimit-reset header and waiting for further download possibility with progress
 - [+] expand songs table to full width on player profile
 
0.7.6
 - [+] increase the height of the rank graph on the player's profile
 
0.7.5.2
 - [*] change SS API limit to 80 reqs/min according to latest API change
 
0.7.5.1
 - [!] hotfix after SS API data format change
 
0.7.5
 - [*] change rate limits for Score Saber API
 
0.7.4.1-3
 - [!] hot bugfixes - refresh was broken when there was no data (first run), thx Majikkuu for bug report
 
0.7.4
 - [+] estimated map difficulty for several accuracies needed for get PP on player profile
 
0.7.3
 - [+] refresh component added to player profile
 
0.7.2
 - [+] pp change on global country leaderboard
 
0.7.1.1
 - [!] bugfix: storing user history during each data refresh
 
0.7.1
 - [+] cache the Beat Saver song data after downloading
 - [+] difference from previous play on profile songs (top/recent)
 
0.7
 - [+] all API calls are now done using a rate limiting queue
 - [!] fix: the song leaderboard was not automatically refreshed after downloading new data

0.6.9.9
 - [+] showing the difference from previous play on song leaderboard
 
0.6.9.8
 - [+] remove inactive users (thx Patian!)
 
0.6.9.7
 - [*] convert country song leaderboard to Svelte components
 
0.6.9.6
 - [*] do not replace the accuracy field for ranked songs on player profile
 
0.6.9.5
 - [!] fix updating ranked songs 
 
0.6.9.4
 - [*] convert country ranking to Svelte components
 
0.6.9.3
 - [*] Svelte integration for components development
 
0.6.9.2
 - [*] faster initialization if SSE is installed
 
0.6.9.1
 - [!] fix bug with disappearing "whatif" buttons after scores refresh
 
0.6.9
 - [*] now using [SettingDust/webpack-tampermonkey](https://github.com/SettingDust/webpack-tampermonkey) template for easier development
 
0.6.8
 - [+] any pp boundary info to player's profile
 
0.6.7
 - [+] +1pp boundary info to player's profile
 
0.6.6
 - [+] "what if I play like that" feature
 
0.6.5
 - [+] new/changed rankeds info after refresh
 
0.6
 - [+] update older plays PPs when song is ranked/unranked/nerfed 

0.5.5
 - [+] option to show original or cached version of global country leaderboard
 
0.5.4
 - [!] bugfix global country leaderboard is transformed only when rank history data is in cache
 
0.5.3
 - [+] easter egg
 
0.5.2
 - [+] links to proper score ranks page on top/recent scores and song leaderbords
 
0.5.1
 - [*] small visual only modifications
 
0.5
 - [+] score+accuracy pair to all top/recent songs for cached users
 
0.4
 - [+] change period selector to global country leaderboard 
 
0.3
 - [+] global country leaderboard with additional users

0.2
 - [+] ranked play count/total ranked score/ranked accuracy to profile page
 - [+] accuracy for every song on country leaderboard, even unranked ones
 - [+] option to add arbitrary user(s) to song country leaderboard
 - [+] configurable SSE delay for peaceful coexistence

0.1
 - Initial version