import fetch from 'node-fetch';
import * as fs from 'fs';
import { parse } from "node-html-parser";
import async from "async";

const categoryLinks = [];
let done = 0;

await parseMainPage();
await parseTests();
console.log('Завершено');

async function parseMainPage() {
  return await fetch("https://www.drivingtest.ca/practice-driving-tests/")
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
    const page = await loadSingleTestPage(_test.link);
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
  const data = { title: test.title, test: [] };
  const document = parse(page);
  const questions = [...document.querySelectorAll(".step:not(.ays_thank_you_fs)")].slice(1);

  questions.forEach((item) => {
    data["test"].push(
      formatSingleQuestion(item)
    );
  });

  return data;
}

function formatSingleQuestion(item) {
  const name = item.querySelector(".ays_quiz_question p")?.innerText || "";
  const image = item.querySelector(".ays-image-question-img img")?.getAttribute("data-lazy-src");
  const buttons = [...item.querySelectorAll(".ays-quiz-answers .ays-field")].reduce((arr, button, index) => {
    const text = `${index + 1}) ${button.querySelector(".ays-quiz-keyboard-label").innerText}`;
    const seccess = button.querySelector("[name='ays_answer_correct[]']").value == "1";
    arr.push({ text, seccess });
    return arr;
  }, []);
  
  return {
    name,
    image,
    buttons,
  }
}

async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

function write(obj, lang = 'rus') {
  fs.writeFileSync(`./new.tests.js`, JSON.stringify(obj, null, 2), 'utf-8');
}