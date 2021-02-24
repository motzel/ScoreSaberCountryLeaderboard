import createRepository from './generic';

let repository;

export default () => repository ? repository : repository = createRepository('beat-savior', '_idbId', {'beat-savior-playerId': 'playerId', 'beat-savior-songId': 'songId'});