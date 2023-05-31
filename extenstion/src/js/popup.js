import "../scss/index.scss";

const buttonParse = document.querySelector(".parse"),
    buttonExport = document.querySelector(".export"),
    inputName = document.querySelector(".name"),
    inputTitle = document.querySelector(".title");

buttonParse.addEventListener("click", () => sendRequest("parse"));
buttonExport.addEventListener("click", () => sendRequest("export"));

function sendRequest(action) {
    const name = inputName.value.trim();
    const title = inputTitle.value.trim();
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            name,
            action,
            title,
        }, function(response) {
            console.log(response);
        });
    });
}