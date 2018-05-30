#!/usr/bin/env node
"use strict";

var _yargs = _interopRequireDefault(require("yargs"));

var _ghGot = _interopRequireDefault(require("gh-got"));

var _lodash = _interopRequireDefault(require("lodash"));

var _pad = _interopRequireDefault(require("pad"));

var _ui = require("./ui");

var _slack = require("./slack");

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = _yargs.default.usage('$0 <cmd> [args]').option('slack-token', {
  demandOption: true,
  describe: "slack's token",
  type: 'string'
}).option('slack-channel', {
  demandOption: true,
  describe: 'to post slack channel',
  type: 'string'
}).option('github-access-token', {
  demandOption: true,
  describe: "github's access token",
  type: 'string'
}).option('github-organization', {
  demandOption: true,
  describe: "github's organization name",
  type: 'string'
}).option('github-username', {
  demandOption: true,
  describe: "github's username",
  type: 'string'
}).option('format', {
  alias: 'f',
  describe: 'output format',
  type: 'string',
  default: 'slack'
}).help().argv;

const {
  slackToken,
  slackChannel,
  githubAccessToken,
  githubOrganization,
  githubUsername,
  format
} = argv;
(async () => {
  const {
    body: preIssues
  } = await (0, _ghGot.default)(`orgs/${githubOrganization}/issues`, {
    token: githubAccessToken,
    query: {
      filter: 'assigned',
      state: 'open',
      sort: 'updated'
    }
  });
  const latestMessage = await (0, _slack.fetchLatestMessage)({
    slackToken,
    slackChannel
  });
  const latestMessageIssues = latestMessage.into();
  let issues = preIssues.map(issue => ({ ...issue,
    history: false,
    id: issue.id,
    repository: issue.repository.full_name,
    url: issue.html_url,
    issueTitle: issue.title
  }));

  if (latestMessage.isToday()) {
    issues = [...latestMessageIssues, ...issues];
  }

  issues = issues = Object.values(issues.reduce((acc, issue) => {
    acc[issue.id] = issue;
    return acc;
  }, {}));

  const grouped = _lodash.default.groupBy(issues, issue => issue.repository);

  const repositories = Object.keys(grouped).map(repository => repository);
  const unmount = (0, _ui.render)({
    argv,
    slack: latestMessage,
    repositories,
    grouped,
    choicedIssues: issues.filter(issue => {
      return latestMessageIssues.some(lmi => lmi.id === issue.id);
    })
  }, format);
})().catch(err => {
  console.error(err);
});