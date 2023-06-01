import { parse } from "node-html-parser";
let tests = {};
const testsLinks = [];
const categoryLinks = [];

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  const _tests = localStorage.getItem("tests");
  tests = _tests ? JSON.parse(_tests) : {};
  const { name, action, title } = request;
  console.log(name, action);
  if (action === "parse") {
    // parseTestPage(name, title);
    await parseThemesLinks();
    console.log("themes parsed");
    await parseAllCategories();
    console.log("categories parsed");
    await parseTests();
    console.log("tests parsed");
  } else {
    exportTests();
  }
});

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
    console.log(`${~~(index / testsLinks.length * 100)}%`)
  }
}

async function loadSingleTestPage(link) {
  return await fetch(link)
  .then((res) => res.text())
  .then((text) => {
    return text;
  });
}

function parseTestPage(html, {title}) {
  const data = {
    title,
    test: [],
  };
  const document = parse(html);
  const questions = document.querySelectorAll(".advq_question_container");

  questions.forEach((item) => {
    data.test.push(
      formatSingleQuestion(item)
    );
  });

  return data;
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

function exportTests() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tests));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "tests.json");
  document.body.appendChild(dlAnchorElem);
  dlAnchorElem.click();
}