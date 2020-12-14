import chalk from 'chalk';
import { SftpSyncConfig, SftpSyncOptions } from 'sftp-sync-deploy/lib/config';
import { SftpSync } from 'sftp-sync-deploy/lib/sftpSync';

function deploy(config, options) {
  const deployer = new SftpSync(config, options);
  deployer.initQueuifiedSftp();
  config.remoteDir && deployer.queuifiedSftp.mkdir(config.remoteDir);

  console.log(chalk.green(`* Deploying to host ${config.host}`));
  console.log(chalk.grey('* local dir  = ') + deployer.localRoot);
  console.log(chalk.grey('* remote dir = ') + deployer.remoteRoot);
  console.log('');

  return deployer.sync();
};

// const { deploy } = require('sftp-sync-deploy');
const core = require('@actions/core');
const github = require('@actions/github');

console.log(core.getInput('dryRun'));

let config = {
  host: core.getInput('host'), // Required.
  port: core.getInput('port'), // Optional, Default to 22.
  username: core.getInput('username'), // Required.
  password: core.getInput('password'), // Optional.
  //  privateKey: '/path/to/key.pem', // Optional.
  //  passphrase: 'passphrase',       // Optional.
  //  agent: '/path/to/agent.sock',   // Optional, path to the ssh-agent socket.
  localDir: core.getInput('localDir'), // Required, Absolute or relative to cwd.
  remoteDir: core.getInput('remoteDir') // Required, Absolute path only.
};

let options = {
  dryRun: JSON.parse(core.getInput('dryRun')), // Enable dry-run mode. Default to false
  excludeMode: 'remove', // Behavior for excluded files ('remove' or 'ignore'), Default to 'remove'.
  forceUpload: true // Force uploading all files, Default to false(upload only newer files).
};

deploy(config, options)
  .then(() => {
    console.log('sftp upload success!');
  })
  .catch(err => {
    console.error('sftp upload error! ', err);
    core.setFailed(err.message)
  });
