# ScoreSaber Country Leaderboard
Provides additional features to the [ScoreSaber](https://scoresaber.com). See the feature list below.

# Userscript installation
Get Tampermonkey for [Chrome/Edge Chromium](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/). Then install the script from [here](https://github.com/motzel/ScoreSaberCountryLeaderboard/raw/master/dist/scoresaber-country-leaderboard.user.js).

# Quickstart

Go to your ScoreSaber profile page and click "Set as your profile". All your scores will be downloaded in a few minutes.

You can also check the plugin settings and make changes according to your preferences (the cog button).

Then, depending on the selected mode:

- **Friends mode**: Go to the profile of each player you want to add and click "Add to Friends" button (star icon).

- **Country mode**: Go to the ranking page of your country and click "Set as the current country" button. The results of all top 50 players from your country will be downloaded. Because the ScoreSaber API has a download limit of 640 scores (80 request, 8 scores each) per minute the whole process will take a lot of time, approximately 1 hour. However, this is a one-time process. Then only new results will be downloaded, which will only take a few dozen seconds. Alternatively, if you have a friend who has already downloaded results from your country, you can ask him to export the data. In that case, all you have to do is import them and then set your profile as above.

- **Mixed mode**: You can also set your country and then add profiles of other players to be supported by the plugin.

# Feature list

TODO :-)

# Changelog
You can find change log [here](CHANGELOG.md).

# Develop
- `npm install`
- `npm run dev`
- Copy the content of `./test/header.js` to the TamperMonkey script editor.

## Build
- `npm run build` 
