import fetch from 'node-fetch';
import * as fs from 'fs';
import { parse } from "node-html-parser";
import async from "async";
import https from "https";
import path from 'path';
import { fileURLToPath } from 'url';

const categoryLinks = [];
let done = 0;
let images = 0;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await parseMainPage();
await parseTests();
console.log('Завершено. Images:', images);

async function parseMainPage() {
  // return await fetch("https://www.drivingtest.ca/practice-driving-tests/")
  // return await fetch("https://www.drivingtest.ca/motorcycle-knowledge-test/")
  return await fetch("https://www.drivingtest.ca/commercial-drivers-licence-practice-test/")
  .then((res) => res.text())
  .then((text) => {
    const document = parse(text);
    const items = document.querySelectorAll(".elementor-widget-wrap .elementor-icon-list-item a");
    items.map((item) => {
      categoryLinks.push({
        link: item.getAttribute("href"),
        title: item.innerText.replaceAll(/[\n]/g, "").trim(),
      });
    })
  });
}

async function parseTests() {
  const tests = {};
  let testsPages = await async.map(categoryLinks, async (category) => {
    return await getSingleCategoryTests(category);
  });

  testsPages = testsPages.reduce((arr, item) => {
    arr.push(...item)
    return arr;
  }, []);

  await async.map(testsPages, async (_test) => {
    await sleep(100);
    const page = await loadSingleTestPage(_test.link);
    await sleep(300);
    const test = await parseSingleTestPage(page, _test);
    done++;

    console.log(~~(done / testsPages.length * 100));

    if (!tests[_test.category]) tests[_test.category] = [];

    tests[_test.category].push(test);
  });

  write(tests);
}

async function getSingleCategoryTests(category) {
  const testsLinks = [];
  await fetch(category.link)
  .then((res) => res.text())
  .then((text) => {
    const document = parse(text);
    const items = document.querySelectorAll(".elementor-widget-wrap .elementor-icon-list-item a");
    return items.map((item, index) => {
      testsLinks.push({
        link: item.getAttribute("href"),
        title: index + 1,
        name: item.querySelector(".elementor-icon-list-text").innerText.replaceAll(/[\n]/g, "").trim(),
        category: category.title,
      });
    })
  });
  return testsLinks;
}

async function loadSingleTestPage(link) {
  return await fetch(link)
  .then((res) => res.text())
  .then((text) => {
    return text;
  });
}

function parseSingleTestPage(page, test) {
  const data = { title: test.title, name: test.name, test: [] };
  const document = parse(page);
  let quizAppType = document.querySelector(".mtq_question") ? 1 : 0;
  let questions = null;
  if (quizAppType === 1) {
    questions = document.querySelectorAll(".mtq_question");
  } else {
    questions = [...document.querySelectorAll(".step:not(.ays_thank_you_fs)")].slice(1);
  }

  questions.forEach((item) => {
    data["test"].push(
      quizAppType === 1 ? formatSingleQuestionType1(item) : formatSingleQuestionType2(item)
    );
  });

  return data;
}

function formatSingleQuestionType1(item) {
  let name = item.querySelector(".mtq_question_text")?.innerText || "";
  let image = item.querySelector("img")?.getAttribute("data-lazy-src");
  
  const buttons = [...item.querySelectorAll(".mtq_answer_table .mtq_clickable")].reduce((arr, button, index) => {
    const text = `${index + 1}) ${button.querySelector(".mtq_answer_text").innerText}`;
    // const seccess = (/alt=\W(correct)\W/gi).test(button.innerHTML);
    const seccess = button.querySelector(".mtq_marker").getAttribute("alt").toLowerCase() == "correct";
    arr.push({ text, seccess });
    return arr;
  }, []);

  if (name) {
    name = name.replaceAll(/<.*?>/gi, "");
    name = name.replaceAll(/[\n]/g, "").trim();
  }

  if (!image) {
    image = "/img/noimage.png";
  } else {
    downloadImage(image);
  }
  
  return {
    name,
    image,
    buttons,
  }
}

function formatSingleQuestionType2(item) {
  let name = item.querySelector(".ays_quiz_question p")?.innerText || "";
  let image = item.querySelector(".ays-image-question-img img")?.getAttribute("data-lazy-src");
  const buttons = [...item.querySelectorAll(".ays-quiz-answers .ays-field")].reduce((arr, button, index) => {
    const text = `${index + 1}) ${button.querySelector(".ays-quiz-keyboard-label").innerText}`;
    const seccess = button.querySelector("[name='ays_answer_correct[]']").getAttribute("value") == "1";
    arr.push({ text, seccess });
    return arr;
  }, []);
  
  if (name) {
    name = name.replaceAll(/<.*?>/gi, "");
    name = name.replaceAll(/[\n]/g, "").trim();
  }

  if (!image) {
    image = "/img/noimage.png";
  } else {
    downloadImage(image);
  }
  
  return {
    name,
    image,
    buttons,
  }
}

async function downloadImage(link, tries = 0) {
  // return;
  await sleep(500);

  if (link.includes("noimage")) {
    return;
  }
  const imageName = link.split("/").slice(-1)[0];
  const pathName = path.resolve(__dirname, "img", imageName);
  const file = fs.createWriteStream(pathName);
  const imageLink = link.replace("http:", "https:");

  https.get(imageLink, response => {
    response.pipe(file);

    file.on('finish', () => {
      images++;
      file.close();
      console.log(`Image downloaded as ${imageName}`);
    });
  }).on('error', err => {
    // fs.unlink(imageName);
    if (tries < 5) {
      setTimeout(() => {
        tries++;
        downloadImage(link, tries);
      }, 500);
    } else {
      fs.unlink(pathName);
    }
    console.error(`Error downloading image: ${err.message}`);
  });
  // fetch(link)
  // .then((response) => response.arrayBuffer())
  // .then((buffer) => {
  //   // Write the buffer to a file
  //   fs.writeFile(file, buffer, (err) => {
  //     if (err) {
  //       console.error(err);
  //     } else {
  //       console.log("Image downloaded successfully");
  //     }
  //   });
  // })
  // .catch((error) => {
  //   console.error(error);
  // });
}

async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

function write(obj) {
  fs.writeFileSync(`./new.tests.js`, JSON.stringify(obj, null, 2), 'utf-8');
}