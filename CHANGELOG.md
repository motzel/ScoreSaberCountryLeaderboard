# Changelog

[+] new function added
[-] function removed
[!] bug fix
[*] other changes

1.1.3
- [!] fix loading the last pages of scores, thx Blackangeleg
- [!] fix the number of score pages on the leaderboard if the value displayed on the ScoreSaber is incorrect

1.1.2
- [!] fix rank url when player's account is inactive
- [*] remove original theme switcher

1.1.1
- [+] add two ways of showing statistics on a player's profile (switchable in settings); you're welcome, Sombra

1.1.0
- [+] add activity chart
- [!] fix rank chart when the player started playing later than 49 days ago  
- [!] fix adding country players to friends, thx Thanos
- [!] fix refreshing twitch videos for just added players

1.0.0

- [+] browsing player's scores and songs leaderboards without the page reloading
- [+] integrated song leaderboard
- [+] global and country leaderboards on a player's profile
- [+] the latest Twitch VODs on a player's profile
- [+] acc chart filterable by period & acc badges
- [+] compare scores to other players, even not cached ones
- [+] automatic profile refreshing

0.9.9.8
- [!] fix fresh start, thx Drakonno

0.9.9.7
- [*] db cache rewrite
- [!] fix country rank bug, thx Drakonno
- [!] fix adding player to friends

0.9.9.6
- [!] fix song history bug, thx Drakonno

0.9.9.5
- [+] The acc chart and acc badges now using real acc instead of incorrect one displayed on the SS page, thx Rocker

0.9.9.4
- [!] rankeds played before they became rankeds were not downloaded again if during updating player had no other scores to download

0.9.9.3
- [!] player data (e.g. pp chart) were not downloaded if the country mode was selected and the player was not in the top 50, thx Velheor

0.9.9.2
- [!] hotfix - chart switching 

0.9.9.1
- [!] hotfix - database conversion did not work in firefox

0.9.9
- [*] rewriting of the data layer
- [+] add best/avg rank in country leaderboards to the player profile, thx Rocker

0.9.8.8 / 0.9.8.7
- [!] the percentage on the leaderboard page is not changed if the score is with modifiers and a percentage is available

0.9.8.6
- [+] now a double-clicking on the song's leaderboard closes it, thx Rocker

0.9.8.5
- [!] fix rank chart timezone problem

0.9.8.4
- [!] fix overwriting of the previous score date when refreshing rank

0.9.8.3
- [!] "not played only" filter fix, thx Modren

0.9.8.2
- [+] mini global ranking on the player's profile, thx Drakonno

0.9.8.1
- [+] mini country ranking on the player's profile, thx Agent

0.9.8
- [+] show country rank info for each song
- [+] country rank filtering, thx Rocker

0.9.7.9
- [*] parsing PPs on the country leaderboard in addition to API data, thx Rocker

0.9.7.8
- [!] displaying previous score fix

0.9.7.7
- [!] score timeset fix

0.9.7.6
- [!] score timeset bug workaround, thx Ghilo

0.9.7.5
- [+] new sorting options

0.9.7.4
- [!] fix strange bug with date processing, thx Gasertall
- [*] update list of rankeds exceptions, thx Astrais

0.9.7.3
- [!] Bug fix with inability to view profiles of players not added to the plugin, thx Drakonno & Rocker for bug report

0.9.7.2
- [+] add pp chart
- [+] add the dashboard filtering by country & friends

0.9.7.1
- [+] add accuracy to the song leaderboard, thx Rocker 

0.9.7
- [+] add an automatically (for the latest scores) or manually (for older results) refreshed rank to the Song Browser

0.9.6.5
- [+] player stats filtering by date of play, thx Solace
- [+] median and std deviation in player profile

0.9.6.4
- [!] fix twitch video preview
- [+] exclude Twitch token from exported data

0.9.6.3
- [+] Twitch profile connection functionality for all players

0.9.6.2
- [+] possibility to manually refresh data even if background downloading is enabled, thx Rocker

0.9.6.1
- [+] date of the previous result is now faded, thx Rocker

0.9.6
- [+] support for countries other than Poland
- [+] friends mode
- [+] song leaderboard filtering by player type

0.9.5.2
- [+] in-place leaderboard in Song Browser when Cards view is selected
- [*] optimize theme initialization

0.9.5.1
- [!] some minor bug fix regarding fragment part in url

0.9.5
- [+] cards view in Song Browser
- [+] i18n support

0.9.4.2
- [+] items in the accuracy chart are now clickable, thx Drakonno

0.9.4.1
- [!] some minor bug fixes

0.9.4
- [+] accuracy chart, thx Modren

0.9.3.2
- [!] fixed visual bug with playlist editing in sniper mode

0.9.3.1
 - [!] fixed keep-view option in Song Browser
 
0.9.3
 - [+] background data downloading 
 
0.9.2.1
 - [!] SS API rate limit handling fix
 
0.9.2
 - [+] possibility to manually add players to the plugin
 
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
 - [+] refresh button on the country dashboard
 
0.9.0.5
 - [!] fixed bug with current page in song browser when filtering narrowing down total count
 
0.9.0.4
 - [+] song leaderboard preview on top/last songs on the country dashboard
 
0.9.0.3
 - [+] background cover to song leaderboard
 
0.9.0.2
 - [*] SSE workaround
 
0.9.0.1
 - [+] show difficulty info in songs on country dashboard, thx Sombra
 
0.9
 - [+] new country ranking dashboard
 
0.8.9.8
 - [!] fix rank parsing, thx Sebanan
 
0.8.9.7
 - [!] fix !bsr copy to clipboard in Firefox, thx Drakonno 
 
0.8.9.6
 - [+] rank in player profile now supports additional country players
 
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