//************************************ modal
function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

const modalHtml = `<div id="myModal" class="modal center">
    <div class="modal-content center">
        <p>` + 'Enter Your Password: anas' + `</p>
        <input type="password" autocomplete="off" name="mainPassword" id="mainPassword">
        <br><br>
        <button class="nicePassButton" id="generatePass">Generate Password</button>

    </div>
</div>`;

const modalStyle = `<style>
.modal {
    display: none; /* Hidden by default */
    z-index: 1; /* Sit on top */
    left: 33%;
    top: 25%;
    width: 33%; /* Full width */
    height: auto; /* Full height */
    overflow: auto; /* Enable scroll if needed */

}
.modal-content {
    background-color: #b3edad;
    border:3px solid #12751d;
    color : #12751d;
    font-weight: bold;
    padding: auto;
}

.center {
  margin: auto;
  text-align: center;
}

.nicePassButton {
    border-radius:28px;
    border:1px solid #12751d;
    cursor:pointer;
    color:#12751d;
    font-weight: bold;
    font-family:Arial;
    padding: 10px 12px;
    text-decoration:none;
    text-align: center;
}
.nicePassButton:hover {
    background-color:#12751d;
    color: #fff;
}
.nicePassButton:active {
    position:relative;
    top:1px;
}
</style>`;

let nicePassStyle = htmlToElement(modalStyle);
let nicePassModalElement = htmlToElement(modalHtml);


//************************************ using NicePass button
window.addEventListener('load', function () {
  let inputs = document.getElementsByTagName('input');
  let passwords = [];
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].type.toLowerCase() == 'password') {
      passwords.push(inputs[i])
    }
  }

  if (passwords.length > 0) {
    let field = passwords[0];
    let a = document.createElement('a');
    a.innerHTML = 'NicePass';
    a.className = "generate";
    a.href = '#';

    a.onclick = async function () {
      generateAndFillPassIn(field);
    };
    field.parentNode.append(a);
  }
});
//************************************************************************
//************************************************************************
//************************************ using Ctrl double Click
/*document.addEventListener("dblclick", function (event) {
 if (event.ctrlKey) {
 let field = event.target;
 if (field.tagName === "INPUT") {
 generateAndFillPassIn(field);
 }
 }
 });
 */
//************************************************************************
//************************************************************************
//************************************ using Ctrl Enter
document.addEventListener("keyup", function (event) {
  if (event.ctrlKey) {
    if (event.code === "Enter") {
      let field = event.target;
      if (field.tagName === "INPUT") {
        event.preventDefault();
        generateAndFillPassIn(field);
      }
    }
  }
});
//************************************************************************
//************************************************************************
//************************************ using context menu
var clickedEl = null;
document.addEventListener("contextmenu", function (event) {
  clickedEl = event.target;
}, true);
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request == "nicepass") {
    generateAndFillPassIn(clickedEl);
  }
});
//************************************************************************
//************************************************************************
//************************************ generateAndFillPassIn Function
async function generateAndFillPassIn(field) {
  // parse hostname :
  // https://stackoverflow.com/questions/9752963/get-domain-name-without-subdomains-using-javascript
  let host = window.location.hostname;
  //let password = prompt("Enter Your Password (" + host + ")");
  let password = await myPrompt('Hey');

  // var p = new Promise(function (resolve, reject) {
  //   chrome.storage.sync.get("passwordHash", ({passwordHash}) => {
  //     resolve(passwordHash);
  //   });
  // });
  // const passwordHash = await p;


  let signature = host + password;
  let generatedPassword = await hashV1(signature);


  field.value = generatedPassword;
  console.log('filled password : ' + generatedPassword);
}


function myPrompt(message) {
  //document.getElementById("myModal")?.remove()
  document.head.append(nicePassStyle);
  document.body.append(nicePassModalElement);
  let passwordField = nicePassModalElement.children[0].children[1];
  let generate = nicePassModalElement.children[0].children[4];

  passwordField.addEventListener("keyup", function (event) {
    if (event.code === "Enter") {
      event.preventDefault();
      generate.click();
    }
  });

  let passwordPromise = new Promise(function (resolve, reject) {

    async function clicked() {
      resolve(passwordField.value);
      passwordField.value = "";
      generate.removeEventListener('click', clicked);
      nicePassModalElement.remove();//.style.display = "none"
    }

    generate.addEventListener("click", clicked);

  });


  document.getElementById("myModal").style.display = "block";
  passwordField.focus();

  return passwordPromise;
}
