const core = require('@actions/core');
const github = require('@actions/github');

const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  (async () => {
  const response = await got(url);
  const dom = new JSDOM(response.body);
  const table = [...dom.window.document.getElementById('content-zone').querySelectorAll('tbody')[1].querySelectorAll('tr')];
    console.log(table)
  })()

} catch (error) {
  core.setFailed(error.message);
}