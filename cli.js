#!/usr/bin/env node
const yargs = require('yargs');
const ghGot = require('gh-got');
const lodash = require('lodash');
const pad = require('pad');

const argv = yargs
  .usage('$0 <cmd> [args]')
  // .command('hello [name]', 'welcome ter yargs!', (yargs) => {
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
  })
  .option('github-access-token', {
    demandOption: true,
    describe: 'github\'s access token',
    type: 'string'
  })
  .option('github-organization', {
    demandOption: true,
    describe: 'github\'s organization name',
    type: 'string'
  })
  .option('github-username', {
    demandOption: true,
    describe: 'github\'s username',
    type: 'string'
  })
  .help()
  .argv;

const {slackToken, githubAccessToken, githubOrganization, githubUsername} = argv;

// console.log(githubAccessToken);
// console.log(`/orgs/${githubOrganization}/repos`);

(async () => {
  const {body: issues} = await ghGot(`orgs/${githubOrganization}/issues`, {
    token: githubAccessToken,
    query: {
      filter: 'assigned',
      state: 'open',
      sort: 'updated',
    }
  });

  const grouped = lodash.groupBy(issues.map(issue => {
    return {
      id: issue.id,
      repository: issue.repository.full_name,
      issueTitle: issue.title,
    };
  }), issue => issue.repository);

  const tabItems = Object.keys(grouped).map(repository => pad(` ${repository}`, 25).slice(0, 25));

  console.log(tabItems);
})()
  .catch(err => {
    console.error(err);
  });
