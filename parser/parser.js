import fetch from 'node-fetch';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { Stream, Transform } from 'stream';
import { parse } from "node-html-parser";

let categories = {
  'B': 'AB',
  'C': 'C',
  'D': 'D',
  'E': 'E',
  'F': 'F'
}

let tests = [];
let language = 'rom';
const categoryLinks = [];

await loadMainPage();
for (let link of categoryLinks) {
  const ticketsLinks = await loadTicketsPage(link);
  console.log(ticketsLinks);
  // const ticket = type+index;
  // const exist = tests.find((item) => `${ticket}` in item);
  // if (exist || !test) break;
  // console.log(ticket)
  // tests.push(
  //   parseTest(test, ticket)
  // );
  // delay(500);
}
// for (let key in categories) {
//   const type = categories[key];

//   for (let index = 1; index < 50; index++) {
//     const test = await getTest(key, index, language);
//     const ticket = type+index;
//     const exist = tests.find((item) => `${ticket}` in item);
//     if (exist || !test) break;
//     console.log(ticket)
//     tests.push(
//       parseTest(test, ticket)
//     );
//     delay(500);
//   }
// }
// write(tests, language);
console.log('Завершено');

async function loadMainPage() {
  return await fetch("https://russiantestdmv.com/")
  .then((res) => res.text())
  .then((text) => {
    const document = parse(text);
    const items = document.querySelectorAll("#generate-section-1 .customBtn11 a");
    items.map((item) => {
      categoryLinks.push(item.getAttribute("href"));
    })
  });
}

async function loadTicketsPage(link) {
  return await fetch(link)
  .then((res) => res.text())
  .then((text) => {
    const links = [];
    const document = parse(text);
    const items = document.querySelectorAll(".testContainer a");
    items.map((item) => {
      links.push(item.getAttribute("href"));
    });
    return links;
  });
}

function parseTest(test, ticket) {
  console.log(22222)
  const output = [];
  for (let i = 0; i < test.length; i++) {
    let buttons = [];
    let answers = [];
    let current = {};
    let item = test[i]
    let correctAnwser = parseInt(item.hash.charAt(5 + item.qid % 10 * 2));
    answers = item.answers.split('|');
    for (let i = 1; i <= answers.length; i++) {
      buttons.push({
        "text": `${i}) ${answers[i - 1]}`,
        "seccess": i == correctAnwser,
      });
    }

    current.buttons = buttons;
    current.comment = item.hint;
    current.image = item.has_img == '0' ? 
      `https://pdd-md.online/src/img/noimage.jpg` :
      `https://pdd-md.online/src/img/book/${item.category}/${item.qid}.jpg`;

    // downloadImageFromURL(current.image, current.image.split('/').slice(-1)[0], `../src/img/book/${item.category}/`);
    current.name = item.question;
    output.push(current);
  }
  
  return {
    [ticket]: output,
  };
}

function downloadImageFromURL(url, filename, path) {
  console.log(url, filename, path)
  var client = http;
  if (url.toString().indexOf("https") === 0){
    client = https;
   }

  client.request(url, function(response) {                                        
    var data = new Transform();                                                    

    response.on('data', function(chunk) {                                       
       data.push(chunk);                                                         
    });                                                                         

    response.on('end', function() {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true })
      }                                    
      fs.writeFileSync(path + filename, data.read());                               
    });                                                                         
 }).end();
};

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function write(obj, lang = 'rus') {
  fs.writeFileSync(`../docs/${lang}.tests.js`, JSON.stringify(obj, null, 2), 'utf-8');
}