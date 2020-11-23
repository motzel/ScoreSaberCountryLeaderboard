import createRepository from './generic';

let repository;

// TODO: not used to anything else rankeds. either store all new leaderboards during scores update or rename it to rankeds
export default () => repository ? repository : repository = createRepository('leaderboards', 'leaderboardId');