const { ipcRenderer } = require("electron");
//const { post } = require("got");

global.sendToWindow = (type, args = undefined) => {
  console.log(type, args);
  if(args == undefined) return ipcRenderer.sendToHost(type)
  ipcRenderer.sendToHost(type, args)
}
var isReady = true;

document.addEventListener('DOMContentLoaded', (event) => {
  if(isReady == false) return console.log("Page was already loaded once before.");
  isReady = false;
  console.log("Page loaded.");


  if(document.querySelectorAll('iframe').length > 0) sendToWindow('iframe');

  getRequiredScripts(window.location.href.toString())
  .then(data = (data) => {
    var script = document.createElement('script'); 
    script.className = "SimScript";
    script.innerHTML = data;
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  })
  .catch(error => console.log(error));

  window.addEventListener("message", function(event) {
    console.log(event.data);
    if(event.data.type == "viewUser"){
      sendToWindow('viewUser', event.data.url)
    }
    if(event.data.type == "retrieveItem"){
      sendToWindow('retrieveItem', event.data)
    }
    if(event.data.type == "keybind"){
      sendToWindow('keybind', event.data.key)
    }
  });
  //END OF LOAD
})


window.addEventListener('load', function () {
  getRequiredScriptsAfter(window.location.href.toString())
  .then(data = (data) => {
    var script = document.createElement('script'); 
    script.className = "SimEndScript";
    script.innerHTML = data;
    script.onload = function() {
      this.remove();
    };
    (document.body).insertAdjacentElement('beforeend', script);
  })
  .catch(error => console.log(error));
})




const getRequiredScripts = async (url) => {
  var script = "";
  if(url.includes('simple-mmo.com/chat/')){
    script += `
    try{
      document.querySelector('#smmo-chat').classList.remove('rounded-lg');
    }
    catch(e){
      console.log(e);
    }

    function keybind(key){
      var item = {
        type: "keybind",
        key: key
      }
      window.postMessage(item);
    }

    var keyBindListener = function (e){
      console.log(e);
      var pressedKey = "";
      if(e.type == "mousedown"){
        if(e.button != 0 && e.button != 1 && e.button != 2){
          if(e.shiftKey) pressedKey += "Shift+";
          if(e.ctrlKey) pressedKey += "Ctrl+";
          if(e.altKey) pressedKey += "Alt+";
          pressedKey += 'Mouse' + e.button;
        }
      }
      else if(e.type == "keypress"){
        if(e.shiftKey) pressedKey += "Shift+";
        if(e.ctrlKey) pressedKey += "Ctrl+";
        if(e.altKey) pressedKey += "Alt+";
        pressedKey += e.code;
      }
      else if(e.type == "keydown"){
        if(e.shiftKey) pressedKey += "Shift+";
        if(e.ctrlKey) pressedKey += "Ctrl+";
        if(e.altKey) pressedKey += "Alt+";
        pressedKey += e.code;
      }
      if(document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && pressedKey != '') keybind(pressedKey);
    }
    try{
      window.addEventListener('keypress', this.keyBindListener, false);
      window.addEventListener('keydown', function(e){
        if((e.key.startsWith('F') && e.key != "F") || e.key == 'Escape' || e.key == 'Backspace') self.keyBindListener(e);
      }, false);
      window.addEventListener('mousedown', this.keyBindListener, false);
    }
    catch (error) {
      console.log(error);
    }

    
    const app = {
      openLink: (url) => {
        viewUser(url);
      },
    }


    function viewUser(url){
      let item = {
        type: 'viewUser',
        url: url
      }
      window.postMessage(item);
    }
    
    
    `;
  
  }
  return script;
}

const getRequiredScriptsAfter = async (url) => {
  var script = "";
  if(url.includes('chat.simple-mmo.com/')){
    script += `

    try{
      eval(update_chat.toString().replace('app.openLink(', 'viewUser('));
      eval(update_chat.toString().replace('$.each(data, function(index, element) {', '$.each(data, function(index, element) { if(element.text.includes("app.openLink")){element.text = element.text.replace("app.openLink", "viewUser");} if(element.text.includes("/img") && !element.text.includes("simple-mmo.com/img")){ element.text = element.text.replace("/img", "simple-mmo.com/img"); }'));
      update_chat();
    }
    catch(e){
      console.log(e);
    }


    function retrieveItem(id, tempid){
      let item = {type: "retrieveItem", id: id, tempId: tempid }; 
      window.postMessage(item);
    }

  `;
  }

  if(url.includes('simple-mmo.com/chat/')){
    script += `
    function retrieveItem(id, tempid){
      let item = {type: "retrieveItem", id: id, tempId: tempid }; 
      window.postMessage(item);
    }
    `;
  }


  return script;
}



/* Additional functions */

