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
const testsLinks = ["https://russiantestdmv.com/testy-dmv-shtata-vashington-na-russkom-yazyke/test-dmv-shtata-vashington-1/"];

// await parseMainPage();
// await parseAllCategories();
await parseTests();
// console.log(testsLinks);

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

async function parseMainPage() {
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

async function parseSingleGategoryPage(link) {
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

async function parseAllCategories() {
  for (let link of categoryLinks) {
    const ticketsLinks = await parseSingleGategoryPage(link);
    testsLinks.push(...ticketsLinks);
  }
}

async function loadSingleTestPage(link) {
  return await fetch(link)
  .then((res) => res.text())
  .then((text) => {
    return text;
  });
}

function parseTestPage(html) {
  const test = {"asd": []};
  const document = parse(html);
  const questions = document.querySelectorAll(".advq_question_container");

  questions.forEach((item) => {
    test["asd"].push(
      formatSingleQuestion(item)
    );
  });

  return test;
}

function formatSingleQuestion(item) {
  const name = item.querySelector(".advq_question").innerText;
  const image = item.querySelector(".advq_question_image img")?.getAttribute("src");
  const buttons = [...item.querySelectorAll(".quiz_unselected_answer")].reduce((arr, button, index) => {
    const text = `${index + 1}) ${button.querySelector("label").innerText}`;
    const seccess = button.querySelector("input").getAttribute("data-rule") == "1";
    arr.push({ text, seccess });
    return arr;
  }, []);
  return {
    name,
    image,
    buttons,
  }
}

async function parseTests() {
  for (let link of testsLinks) {
    const testPageHtml = await loadSingleTestPage(link);
    const test = parseTestPage(testPageHtml);
    tests.push(test);
  }

  write(tests, language);
}

function write(obj, lang = 'rus') {
  fs.writeFileSync(`./${lang}.tests.js`, JSON.stringify(obj, null, 2), 'utf-8');
}