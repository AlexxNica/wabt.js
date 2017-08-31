var simpleGit  = require("simple-git");
var semver     = require("semver");
var dateFormat = require('dateformat');

var src = {
  git: simpleGit(__dirname + "/../wabt"),
  filter: tag => {
    var match = /^(\d+\.\d+\.\d+)$/.exec(tag);
    return match ? {
      tag: tag,
      version: match[1]
    } : null;
  }
};

var dst = {
  git: simpleGit(__dirname + "/.."),
  filter: tag => {
    var match = /^v(\d+\.\d+\.\d+)$/.exec(tag);
    return match ? {
      tag: tag,
      version: match[1]
    } : null;
  }
};

function latest(repo) {
  return new Promise((resolve, reject) => {
    repo.git.tags({ "--sort": "-committerdate" }, (err, tags) => {
      if (err)
        return reject(err);
      for (var i = 0; i < tags.all.length; ++i) {
        var result = repo.filter(tags.all[i]);
        if (result !== null) {
          repo.tag = result.tag;
          repo.version = result.version;
          return resolve();
        };
      }
      return reject(Error("no matching tags"));
    });
  });
}

Promise.all([
  latest(src),
  latest(dst)
]).then(() => {
  if (process.argv[2] === "tag")
    console.log(src.tag);
  else if (semver.gt(src.version, dst.version))
    console.log(src.version);
  else
    console.log(src.version + "-nightly." + dateFormat(Date.UTC(), "yyyymmdd"));
}).catch(err => {
  throw err;
});