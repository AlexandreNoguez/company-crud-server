#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function incrementVersion(version, type = 'patch') {
  const [major, minor, patch] = version.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

const [, , currentVersionArg, bumpType = 'patch'] = process.argv;

if (!currentVersionArg) {
  console.error('Error: Current version is required.');
  process.exit(1);
}

const newVersion = incrementVersion(currentVersionArg, bumpType);

const versionFilePath = path.resolve(__dirname, '../../version.txt');
fs.writeFileSync(versionFilePath, `${newVersion}\n`);

console.log(newVersion);
