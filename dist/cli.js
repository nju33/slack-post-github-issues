#!/usr/bin/env node
"use strict";

var _yargs = _interopRequireDefault(require("yargs"));

var _ghGot = _interopRequireDefault(require("gh-got"));

var _lodash = _interopRequireDefault(require("lodash"));

var _pad = _interopRequireDefault(require("pad"));

var _ui = require("./ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = _yargs.default.usage('$0 <cmd> [args]') // .command('hello [name]', 'welcome ter yargs!', (yargs) => {
//   yargs.positional('name', {
//     type: 'string',
//     default: 'Cambi',
//     describe: 'the name to say hello to'
//   })
// }, function (argv) {
//   console.log('hello', argv.name, 'welcome to yargs!')
// })
.option('slack-token', {
  demandOption: true,
  describe: 'slack\'s token',
  type: 'string'
}).option('github-access-token', {
  demandOption: true,
  describe: 'github\'s access token',
  type: 'string'
}).option('github-organization', {
  demandOption: true,
  describe: 'github\'s organization name',
  type: 'string'
}).option('github-username', {
  demandOption: true,
  describe: 'github\'s username',
  type: 'string'
}).help().argv;

const {
  slackToken,
  githubAccessToken,
  githubOrganization,
  githubUsername
} = argv; // console.log(githubAccessToken);
// console.log(`/orgs/${githubOrganization}/repos`);

(async () => {
  const {
    body: issues
  } = await (0, _ghGot.default)(`orgs/${githubOrganization}/issues`, {
    token: githubAccessToken,
    query: {
      filter: 'assigned',
      state: 'open',
      sort: 'updated'
    }
  });

  const grouped = _lodash.default.groupBy(issues.map(issue => {
    return {
      id: issue.id,
      repository: issue.repository.full_name,
      issueTitle: issue.title
    };
  }), issue => issue.repository);

  const repositories = Object.keys(grouped).map(repository => (0, _pad.default)(` ${repository}`, 25).slice(0, 25));
  (0, _ui.render)({
    repositories,
    grouped
  });
})().catch(err => {
  console.error(err);
});