import createRepository from './generic';

let repository;

// TODO: customize getAll() and getAllFromIndex() methods - don't fetch from DB if cached superset exists
export default () => repository ? repository : repository = createRepository('scores', 'id');