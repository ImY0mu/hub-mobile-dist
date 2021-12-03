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

  getRequiredScripts(window.location.href)
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
    if(event.data == "closeWindow"){
      sendToWindow('closeWindow')
    }
    if(event.data == "updatePlayer"){
      sendToWindow('updatePlayer')
    }
    if(event.data == "templeTimer"){
      console.log('Started the timer!');
      sendToWindow('templeTimer')
    }
    if(event.data.type == "openPageWithSubMenu"){
      sendToWindow('openPageWithSubMenu', event.data)
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
  if(url.includes('https://simple-mmo.com/')){
    script += `
    function changeScrollBar(){
      var styles = "";
      if (window.getComputedStyle(document.body, null).getPropertyValue("background-color") == "rgb(13, 13, 13)"){
        styles = "::-webkit-scrollbar {width: 4px; height: 4px;} ::-webkit-scrollbar-thumb {background: rgba(30, 30, 30, 1);} ::-webkit-scrollbar-thumb:hover {background: rgba(22, 22, 22, 1);} ::-webkit-scrollbar-track {background: rgb(50, 50, 50);}";
      } 
      else{
        styles = "::-webkit-scrollbar {width: 4px; height: 4px;} ::-webkit-scrollbar-thumb {background: rgba(180, 180, 180, 1);} ::-webkit-scrollbar-thumb:hover {background: rgba(200, 200, 200, 1);} ::-webkit-scrollbar-track {background: rgb(220, 220, 220);}";
      }
      var styleSheet = document.createElement("style")
      styleSheet.type = "text/css"
      styleSheet.innerText = styles
      document.head.appendChild(styleSheet)
    }
    changeScrollBar();

    function requiredFunction(){
      window.postMessage('closeWindow');
      window.postMessage('updatePlayer');
    }

    function requiredAppFunction(title, menu){
      try{
        console.log(JSON.parse(menu));
      }
      catch(e){
        console.log(menu);
      }
      
      let item = {
        type: "openPageWithSubMenu", 
        title: title, menu: menu
      }; 
      window.postMessage(item);
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
      if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && pressedKey != '') keybind(pressedKey);
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


  `;
  }

  if(url == 'https://simple-mmo.com/guilds/view/474'){ // add supporter tag to guild
    var icon = 'http://localhost:8081/patreon/star.png';
    //document.querySelector('.container-two .max-w-7xl.mx-auto .text-center').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 mt-1 text-indigo-800"><img class="w-4 h-4 mr-1" src="' + icon + '" /><span class="mt-0.5">Patreon Supporters</span></span></div>');
  }

  if(url.includes('https://simple-mmo.com/temple')){
    script += `
    function templeTimer(){
      console.log('called function');
      window.postMessage("templeTimer");
    }
    `;
  }


  if(url.includes('user/view/')){
    console.log('YES');
    script += `
      var userID = '';
      try{
        userID = window.location.href.split('user/view/')[1];
        if(userID.endsWith('/')) userID = userID.split('/')[0];
        if(userID.includes('#')) userID = userID.split('#')[0];
        console.log(userID);
      }
      catch(e){
        console.log(e);
      }
      function isPatreon(){
        var patreons = JSON.parse(localStorage.patreon);
        Object.keys(patreons).forEach(function (k) {
          if(patreons[k].user_id == userID) {
            console.log('In the list');
            if(patreons[k].tier == 2){
              var icon = 'http://localhost:8081/patreon/star.png';
              if(patreons[k].icon != '') icon = patreons[k].icon;
              document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 mt-1 text-yellow-800"><img class="w-4 h-4 mr-1" src="' + icon + '" /><span class="mt-0.5">Patreon Supporter</span></span></div>');
            }
            if(patreons[k].tier == 1){
              var icon = 'http://localhost:8081/patreon/star.png';
              document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 mt-1 text-indigo-800"><img class="w-4 h-4 mr-1" src="' + icon + '" /><span class="mt-0.5">Patreon Supporter</span></span></div>');
            }
          }
        });
      }
      isPatreon();
    `;

    if(url == 'https://simple-mmo.com/user/view/5944'){
      script += `
      

        function isDev(){
          var icon = 'http://localhost:8081/patreon/dev.png';
          document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 mt-1 text-red-800"><img class="w-4 h-4 mr-1" src="' + icon + '" /><span class="mt-0.5">Developer of Clients</span></span></div>');
        }

        isDev();
      `;
    }
  }


  return script;
}

const getRequiredScriptsAfter = async (url) => {
  var script = "";
  if(url.includes('https://simple-mmo.com/')){
    script += `
    //eval(update_chat.toString().replace('app.openLink(', 'viewUser('));
    function ok(){if(!this||this==window)return new ok;var o=function(){return"thanks for calling!"};return o.__proto__=ok.prototype,o.constructor=ok,o}ok.prototype={close:function(){requiredFunction();swal.close();},__proto__:Function.prototype},ok=new ok;
    
    function app(){
      if(!this||this==window)return new app;
      var o=function(){return"thanks for calling!"};
      return o.__proto__=app.prototype,o.constructor=app,o}
      app.prototype={
        openScrollableTabPage:function(title, menu){requiredAppFunction(title, menu);},
        openFixedTabPage:function(title, menu){requiredAppFunction(title, menu);},
      __proto__:Function.prototype
    },app=new app;
  `;
  }

  if(url.includes('quests/view/') || url.includes('material/gather/')){
    script += `
      try{
        eval(clickAndDisable.toString().replace(clickAndDisable.toString(), "function clickAndDisable(){return window.location.href = '/i-am-not-a-bot?new_page=true'}"));
      }
      catch(e){
        console.log(e);
      }
    `;
  }

  if(url.includes('https://simple-mmo.com/temple')){
    script += `
    try{
      eval(worshipGod.toString()
        .replace('if (result.value) {', 'if (result.value) { templeTimer();')
      );
    }
    catch(e){
      console.log(e);
    }
    `;
  }


  return script;
}

var multiSelect = false;

ipcRenderer.on("activateMultiselect", () => {
  try{
    var buttons = document.querySelectorAll('.text-right.text-indigo-600.text-xs.mt-2.font-medium.mr-2 span');
    if(multiSelect == false){
      multiSelect = true;
      buttons[0].click();
    }
      else{
        multiSelect = false;
        buttons[1].click();
      }
    }
    catch(e){
      console.log(e);
    }
});



/* Additional functions */


