#!/usr/bin/env node

const chokidar = require('chokidar');
const _ = require('lodash');
const Rsync = require('rsync');
const config = require('./.config');
const moment = require('moment');
const clc = require('cli-color');
const emoji = require('node-emoji');

const infoMessage = function infoMessage(text) {
  console.log(emoji.emojify(':loudspeaker:\t') + (text || ''));
};

const doneMessage = function doneMessage(greenText, text) {
  console.log(emoji.emojify('\n:+1:\t' + clc.green(greenText) + '\t\t') + (text || '') + '\n');
};

const syncFiles = function syncFiles() {
  infoMessage('Syncing files');
  new Rsync()
    .flags('av')
    .source(config.localFolder)
    .destination(config.env + ':' + config.remoteFolder)
    .exclude(config.exclude)
    .delete()
    .execute((err) => {
      if (err) throw err;
      doneMessage('Success','Last sync at ' + moment().format('h:mm:ss A') + '.');
    }, (data) => {
      console.log(data.toString('utf8').trim());
    });
};

chokidar.watch(config.localFolder, {
  // ignore .dotfiles
  ignored: /(^|[\/\\])\../
  }).on('ready', () => {
    infoMessage('Watching all files in ' + config.localFolder);
  }).on('all', _.debounce(syncFiles, 500));