import fetch from 'node-fetch';
import * as fs from 'fs';

let categories = {
  'B': 'AB',
  'C': 'C',
  'D': 'D',
  'E': 'E',
  'F': 'F'
}

let tests = [];
let language = 'rom';

for (let key in categories) {
  const type = categories[key];

  for (let index = 1; index < 50; index++) {
    const test = await getTest(key, index, language);
    const ticket = type+index;
    const exist = tests.find((item) => `${ticket}` in item);
    if (exist || !test) break;
    console.log(ticket)
    tests.push(
      parseTest(test, ticket)
    );
    delay(500);
  }
}
write(tests, language);
console.log('Завершено');

async function getTest(category, number, lang = 'rus') {
  return await fetch(`https://pdd-md.online/core.php?cmd=get_q_ticket&lang=${lang}&category=${category}&ticket=${number}`)
  .then((res) => res.text())
  .then((text) => {
    return text.length ? JSON.parse(text) : null;
  });
}

function parseTest(test, ticket) {
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
    current.name = item.question;
    output.push(current);
  }
  
  return {
    [ticket]: output,
  };
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function write(obj, lang = 'rus') {
  fs.writeFileSync(`../docs/${lang}.tests.js`, JSON.stringify(obj, null, 2), 'utf-8');
}