const { ipcRenderer } = require("electron");
const { post } = require("got");

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
    console.log(data);
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
  });
  //END OF LOAD
})


window.addEventListener('load', function () {
  getRequiredScriptsAfter(window.location.href.toString())
  .then(data = (data) => {
    console.log(data);
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



  `;
  }
  return script;
}

const getRequiredScriptsAfter = async (url) => {
  var script = "";
  if(url.includes('https://simple-mmo.com/')){
    script += `
    //eval(update_chat.toString().replace('app.openLink(', 'viewUser('));
    function ok(){if(!this||this==window)return new ok;var o=function(){return"thanks for calling!"};return o.__proto__=ok.prototype,o.constructor=ok,o}ok.prototype={close:function(){requiredFunction();swal.close();},__proto__:Function.prototype},ok=new ok;
    function app(){if(!this||this==window)return new app;var o=function(){return"thanks for calling!"};return o.__proto__=app.prototype,o.constructor=app,o}app.prototype={openScrollableTabPage:function(){requiredAppFunction();},__proto__:Function.prototype},app=new app;
  `;
  }
  return script;
}



/* Additional functions */

