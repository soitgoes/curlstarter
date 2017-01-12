#!/usr/bin/env node

const request = require('request-promise');
const exec = require('child_process').exec;
const logger = require('bunyan').createLogger({name: "curlstart"});
var program = require('commander');

program
  .version('1.0.0')
  .option('-u, --url <url>', 'Url to monitor')
  .option('-i, --interval <interval>', 'Interval to poll')
  .option('-s, --start <start>', 'Start command')
  .parse(process.argv);

function fail(err){
  logger.error(err, `Error checking ${program.url}`);
  logger.info("starting: `" + program.start + "`" );
  if (!program.start){
    logger.info("No start command set.  Nothing to do.");
    return;
  }
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
