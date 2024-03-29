import { parse } from "node-html-parser";
import images from "./images";
let tests = {};
const testsLinks = [];
const categoryLinks = [];

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  const _tests = localStorage.getItem("tests");
  tests = _tests ? JSON.parse(_tests) : {};
  const { name, action, title } = request;
  console.log(name, action);
  if (action === "parse") {
    start2();
  } else {
    exportTests();
  }
});

async function start() {
  await parseThemesLinks();
  console.log("themes parsed");
  await parseAllCategories();
  console.log("categories parsed");
  await parseTests();
  console.log("tests parsed");
  console.log(JSON.stringify(downloadedImages));
}

function start2() {
  chunks(images, 1).forEach((chunk, i) => {
    setTimeout(() => {
      console.log(i + 1, images.length);
      chunk.map(downloadImage2);
    }, i * 500);
  });
}

const chunks = (arr, chunkSize) => {
  let results = [];
  while (arr.length) results.push(arr.splice(0, chunkSize));
  return results;
};

async function parseThemesLinks() {
  const items = document.querySelectorAll("#generate-section-1 .customBtn11 a");
  [...items].map((item) => {
    categoryLinks.push({
      title: item.innerText,
      link: item.getAttribute("href"),
    });
  });
  // [...items].map(async (item) => await parseSingleGategoryPage(item));
}

async function parseAllCategories() {
  for (let link of categoryLinks) {
    const ticketsLinks = await parseSingleGategoryPage(link);
    testsLinks.push(...ticketsLinks);
  }
}

async function parseSingleGategoryPage(link) {
  return await fetch(link.link)
    .then((res) => res.text())
    .then((text) => {
      const links = [];
      const document = parse(text);
      const items = document.querySelectorAll(".testContainer a");
      [...items].map((item) => {
        links.push({
          category: link.title,
          title: item.innerText,
          link: item.getAttribute("href"),
        });
      });
      return links;
    });
}
let index = 0;
async function parseTests() {
  for (let link of testsLinks) {
    const testPageHtml = await loadSingleTestPage(link.link);
    const test = parseTestPage(testPageHtml, link);

    if (!tests[link.category]) {
      tests[link.category] = [];
    }
    tests[link.category].push(test);
    localStorage.setItem("tests", JSON.stringify(tests));
    index++;
    console.log(`${~~((index / testsLinks.length) * 100)}%`);
  }
}

async function loadSingleTestPage(link) {
  return await fetch(link)
    .then((res) => res.text())
    .then((text) => {
      return text;
    });
}

function parseTestPage(html, { title }) {
  const data = {
    title,
    test: [],
  };
  const document = parse(html);
  const questions = document.querySelectorAll(".advq_question_container");

  questions.forEach((item) => {
    // data.test.push(
    //   formatSingleQuestion(item)
    // );
    downloadImage(item);
  });

  return data;
}

const downloadedImages = {};

function downloadImage(item) {
  const image = item
    .querySelector(".advq_question_image img")
    ?.getAttribute("src");

  if (image && !downloadedImages[image]) {
    setTimeout(() => {
      downloadedImages[image] = true;
    });
    console.log(image);
    const urlItems = image?.split("/");
    const name = urlItems ? urlItems[urlItems.length - 1] : "";
    var link = document.createElement("a");
    link.href = image;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function downloadImage2(imageSrc) {
  const urlItems = imageSrc?.split("/");
  const name = urlItems ? urlItems[urlItems.length - 1] : "";
  var link = document.createElement("a");
  link.href = imageSrc;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function formatSingleQuestion(item) {
  const name = item.querySelector(".advq_question").innerText;
  const image = item
    .querySelector(".advq_question_image img")
    ?.getAttribute("src");
  const buttons = [...item.querySelectorAll(".quiz_unselected_answer")].reduce(
    (arr, button, index) => {
      const text = `${index + 1}) ${button.querySelector("label").innerText}`;
      const seccess =
        button.querySelector("input").getAttribute("data-rule") == "1";
      arr.push({ text, seccess });
      return arr;
    },
    []
  );
  return {
    name,
    image,
    buttons,
  };
}

function exportTests() {
  const dataStr =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tests));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "tests.json");
  document.body.appendChild(dlAnchorElem);
  dlAnchorElem.click();
}
