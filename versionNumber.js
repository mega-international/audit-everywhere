const path = require('path');
const fs = require('fs');

const package = require(path.join(__dirname, './package.json'));

const r = /.+\.(.+).js$/gm;
const files = fs.readdirSync(path.join(__dirname, './dist/')).map(file => {
  while ((m = r.exec(file)) !== null) {
    if (m.index === r.lastIndex) {
      r.lastIndex++;
    }
    let [ a, ...b ] = m;
    return b[0];
  }
}).filter(a => a);

if (files.length < 0) return;
const build = files[0];

const version = {
  build: build,
  semver: package.version
};

fs.writeFile(path.join(__dirname, './dist/config/version.json'), JSON.stringify(version, null, 2), 'utf8', (err, data) => {
  if (err) console.log('[Hopex][Error] Generating application version number faillure!!!');
  return console.log('[Hopex][success] Generating application version number success !!!');
});
