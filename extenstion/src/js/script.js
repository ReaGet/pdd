let tests = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const _tests = localStorage.getItem("tests");
  tests = _tests ? JSON.parse(_tests) : {};
  const { name, action, title } = request;
  console.log(name, action);
  if (action === "parse") {
    parseTestPage(name, title);
  } else {
    exportTests();
  }
});

function parseTestPage(name, title) {
  const data = {
    title,
    test: [],
  };
  const questions = document.querySelectorAll(".advq_question_container");

  questions.forEach((item) => {
    data.test.push(
      formatSingleQuestion(item)
    );
  });

  if (!tests[name]) {
    tests[name] = [];
  }
  tests[name].push(data);
  localStorage.setItem("tests", JSON.stringify(tests));
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

// async function parseTests() {
//   for (let link of testsLinks) {
//     const testPageHtml = await loadSingleTestPage(link);
//     const test = parseTestPage(testPageHtml);
//     tests.push(test);
//   }
// }

function exportTests() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tests));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "tests.json");
  document.body.appendChild(dlAnchorElem);
  dlAnchorElem.click();
}