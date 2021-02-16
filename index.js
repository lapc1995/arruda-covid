const core = require('@actions/core');
const github = require('@actions/github');

const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const url = "http://www.oestecim.pt/CustomPages/ShowPage.aspx?pageid=481bf11b-80a2-4b10-ad99-da50ba450b36";

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

    const data = JSON.parse(fs.readFileSync('data.json'));
    
    //Get date
    const translateMonth = {
        "janeiro" : "january",
        "fevereiro" : "february",
        "março" : "march",
        "abril" : "april",
        "maio" : "may",
        "junho" : "june",
        "julho" : "july",
        "agosto" : "august",
        "setembro" : "september",
        "outubro" : "october",
        "novembro" : "november",
        "dezembro" : "december"
    }
    const text = table[1].querySelectorAll('span')[2].textContent.replace(",", "").split(" ");
    const day = text[5];
    const month = translateMonth[text[7]];
    const year = table[1].querySelectorAll('span')[1].textContent.split(" ")[1]
    const timestamp = Date.parse(`${month} ${day}, ${year}`);

    if(data.length === 0 || data[data.length-1].timestamp != timestamp) {
 
        //Get number of cases, number os active cases, number of recuperados, number of death
        const row = [...table[5].querySelectorAll('td')];
        const result = [];
        row.forEach(e => { 
            const temp = e.querySelectorAll('span')[0];
            if(temp != undefined)
                result.push(temp.textContent)    
        })

        const formatted = {
            timestamp,
            "place" : result[0],
            "total" : Number(result[1]),
            "active" : Number(result[2]),
            "recovered" : Number(result[3]),
            "deaths" : Number(result[4])
        }

        data.push(formatted);
        fs.writeFileSync('data.json', JSON.stringify(data));

        console.log(result);
    }

})();

} catch (error) {
  core.setFailed(error.message);
}