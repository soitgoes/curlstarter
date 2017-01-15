#!/usr/bin/env node

const request = require('request-promise');
const exec = require('child_process').exec;

var program = require('commander');

program
  .version('1.0.0')
  .option('-u, --url <url>', 'Url to monitor')
  .option('-i, --interval <interval>', 'Interval to poll')
  .option('-s, --start <start>', 'Start command')
  .option('-l, --log <log>','Log output to')
  .parse(process.argv);



  const logger = require('bunyan').createLogger({
      name: 'curlstart',
      streams: [{
          type: 'rotating-file',
          path: program.log || 'log.txt',
          period: '1d',   // daily rotation
          count: 1        // keep 3 back copies
      },{
        stream: process.stderr
      }
    ]
  });

if (!program.url){
  logger.error("No url set.  Please set a url with -u")
  return;
}
if (!program.start){
  logger.error("No start command set.  Please set a start command with -s");
  return;
}

function fail(err){
  logger.error(err, `Error checking ${program.url}`);
  logger.info("starting: `" + program.start + "`" );

  exec(program.start, (error, stdout, stderr) => {
    if (error) {
      logger.error(`exec error: ${error}`);
      return;
    }
    logger.info(`stdout: ${stdout}`);
    if (stderr){
      logger.error(`stderr: ${stderr}`);
    }
  });
}

function checkSite(){
  return request({method:'GET', uri:program.url,simple:false, resolveWithFullResponse: true}).then((res) => {
      if (res.statusCode !== 200) fail(res.statusCode);
      logger.info("heartbeat success: " + program.url)
    })
    .catch(function (err) {
      fail(err)
    });
}
setInterval(checkSite, program.interval ? parseInt(program.interval) : 10000)
