const { ipcRenderer } = require("electron");
//const { post } = require("got");

global.sendToWindow = (type, args = undefined) => {
  if(args == undefined) return ipcRenderer.sendToHost(type)
  ipcRenderer.sendToHost(type, args)
}
var isReady = true;


sendToWindow('scrollUp');


document.addEventListener('DOMContentLoaded', (event) => {
  if(isReady == false) return console.log("Page was already loaded once before.");
  isReady = false;
  console.log("Page loaded.");

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
    //console.log(event.data);
    if(event.data.type == "openPage"){
      sendToWindow('openPage', event.data.url)
    }
    if(event.data == "scrollUp"){
        scrollUp();
    }
    if(event.data == "scrollDown"){
        scrollDown();
    }
    if(event.data == "refreshPage"){
      refreshPage();
    } 
    if(event.data.name == "create_timer"){
      console.log('Started the timer!');
      sendToWindow('create_timer', event.data);
    }
    if(event.data.type == "updateDiscordActivity"){
      console.log(event.data);
      sendToWindow('updateDiscordActivity', event.data)
    }
    if(event.data.type == "stepTaken"){
      sendToWindow('stepTaken', event.data.key)
    }
    if(event.data.type == "openPageWithSubMenu"){
      sendToWindow('openPageWithSubMenu', event.data)
    }
    if(event.data.type == "keybind"){
      sendToWindow('keybind', event.data.key)
    }
    if(event.data.type == "updatePlayer"){
      sendToWindow('updatePlayer')
    }
  });
  

  if (window.getComputedStyle(document.body, null).getPropertyValue("background-color") == "rgb(13, 13, 13)"){
    changeTheme("dark");
  } 
  else if(window.getComputedStyle(document.querySelector('body div'), null).getPropertyValue("background-color") == 'rgb(26, 32, 44)' || window.getComputedStyle(document.querySelector('body div'), null).getPropertyValue("background-color") == 'rgb(247, 250, 252)'){
    //error page
  }
  else{
    changeTheme("light");
  }







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
  console.log(url)
  var script = "";
  if(url.includes('simple-mmo.com/')){
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


    function scrollUp(){
      window.postMessage("scrollUp");
    }
    function scrollDown(){
      window.postMessage("scrollDown");
    }
    window.addEventListener('wheel', function(event){
      if (event.deltaY < 0){
          scrollUp();
      }
      else if (event.deltaY > 0){
          scrollDown();
      }
    });
    scrollUp();



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

  if(url.includes('simple-mmo.com/userlist/all')){
    script += `
    
    var button = '<button type="button" onclick="if (!window.__cfRLUnblockHandlers) return false; showSearchId()" class="mb-2 w-full text-center justify-center inline-flex items-center px-2.5 py-3 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Visit player by ID</button>';
    var searchForm = '<div style="display: none" id="search_id_content"><form onsubmit="formSubmitFunction(event)" id="id_search_form"><div class="row"><div><input type="text" class="app-input" minlength="1" id="player_id_input" placeholder="Player id..." name="id" /></div></div><button type="submit" class="app-btn  mt-2 mr-1 btn-success px-4 py-2">Visit</button><button type="button" class="app-btn btn-primary px-4 py-2" onclick="if (!window.__cfRLUnblockHandlers) return false; Swal.close();">Close</button></form></div>';


    try{
      document.querySelector('.bg-gray-100.min-h-screen-smmo .px-2.py-2 button').insertAdjacentHTML('afterEnd', button);
    }
    catch(e){
      console.log(e);
    }

    try{
      document.querySelector('main .container-two').insertAdjacentHTML('afterBegin', searchForm);
    }
    catch(e){
      console.log(e);
    }

    


    function formSubmitFunction(e){
      e.preventDefault();
      var id = document.querySelectorAll('#player_id_input')[1].value;
      var url = window.location.href.split('simple-mmo.com/')[0];
      url += 'simple-mmo.com/user/view/' + id;
      window.location.href = url;
    }

    function showSearchId(){
      Swal.fire({
        icon: 'info',
        title: 'Visit player by ID',
        html: document.getElementById("search_id_content").innerHTML,
        showConfirmButton: false,
      });
    }
    `;
  }
  
  if(url.includes('simple-mmo.com/travel')){
    script += `

    var stepCounter = 0;

    var potions = [];

    var selected_potion = null;

    function prepare_potions(){
      var links = document.querySelector('[x-show="potions_dropdown"]').querySelectorAll('a');
      for (let i = 0; i < links.length; i++) {
          var text = links[i].querySelectorAll('div')[2].innerText;
          const potion = {
              type: text.split('%')[1].split('for')[0].split('(')[0].trim(),
              percentage: text.split('%')[0],
              value: parseInt(text.split('(')[1].split('minutes')[0].trim()),
          };
          potions.push(potion);
          var attribute = links[i].getAttribute("onclick");
          links[i].setAttribute('onclick', attribute + '; selected_potion = ' + i + ';')
      }
    }

    prepare_potions();

    function start_potion(){
      
      let item = {
        name: 'create_timer', 
        data: {
          type: 'potion',
          name: potions[selected_potion].type,
          percentage: potions[selected_potion].percentage,
        },
        value: potions[selected_potion].value,
        end: null
      }; 

      window.postMessage(item);
    }


    function prepare_sprint(){
      var button = document.querySelector('[x-show="!sprint.active"]').querySelectorAll('button')[2];
      var attribute = button.getAttribute("x-on:click");
      button.setAttribute("x-on:click", attribute + 'start_sprint();');
    }

    prepare_sprint();


    function start_sprint(){
      var value = parseInt(document.querySelector('#complete-travel-container')._x_dataStack[0].sprint.minutes);
      var current_energy = parseInt(document.querySelector('#player-popup')._x_dataStack[0].user.current_energy);

      if(value > current_energy) return console.error('You do not have enough energy to do this.');
      
      let item = {
        name: 'create_timer', 
        data: {
          type: 'sprint',
          name: ''
        },
        value: value,
        end: null
      }; 


      window.postMessage(item);
    }
    


    function openPage(url){
      console.log(url);

      var pageUrl = window.location.href.split('simple-mmo.com')[0];

      var item = {
        type: "openPage",
        url:  pageUrl + 'simple-mmo.com' + url
      }
      window.postMessage(item);
    }

    var test = null;


    function stepMutator(){
      // Select the node that will be observed for mutations
      const targetNode = document.querySelector('[x-html="travel.text"]');

      // Options for the observer (which mutations to observe)
      const config = { attributes: false, childList: true, subtree: true };

      // Callback function to execute when mutations are observed
      const callback = function(mutationList, observer) {
          // Use traditional 'for loops' for IE 11
          for(const mutation of mutationList) {
              if (mutation.type === 'childList') {
                  console.log('A child node has been added or removed.');
                  if(mutation.addedNodes[mutation.addedNodes.length-1].nodeName == 'DIV'){
                    console.error('IT has a BUTTON!');
                    var button = mutation.addedNodes[mutation.addedNodes.length-1].querySelector('button');

                    try{
                      button.setAttribute('x-on:click', 'clicked=true;' + button.getAttribute('x-on:click').split(';')[1].replace('document.location=', 'openPage(').replace("?new_page=true'", "?new_page=true')"));
                    }
                    catch(e){
                      console.log(e);
                    }
                    
                  }
                  else if(mutation.addedNodes[mutation.addedNodes.length-1].nodeName == 'SPAN' && mutation.addedNodes[mutation.addedNodes.length-1].className == 'relative z-0 inline-flex shadow-sm rounded-md'){
                    console.error('IT has  two BUTTONS!');
                    console.log(mutation.addedNodes[mutation.addedNodes.length-1]);
                    var button = mutation.addedNodes[mutation.addedNodes.length-1].querySelectorAll('a')[0];

                    try{
                      var link = button.getAttribute('href');
                      button.setAttribute('onclick', "openPage('" + link + "');");
                      button.setAttribute('href', '#');
                    }
                    catch(e){
                      console.log(e);
                    }
                    
                  }
                  test = mutation.addedNodes;
              }
              else if (mutation.type === 'attributes') {
                  console.log('The ' + mutation.attributeName + ' attribute was modified.');
              }
          }
      };

      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(callback);

      // Start observing the target node for configured mutations
      observer.observe(targetNode, config);
    }

    stepMutator();
      
    try{
      document.querySelector('#step_button').attributes['x-on:mousedown'].nodeValue = "takeStep; countTheStep();";
    }
    catch(e){
      console.log(e);
    }


    try{
      eval(showPopup.toString().replace('window.location.href=link;', "start_potion(); window.location.href=link;"));
    }
    catch(e){
      console.log(e);
    }

    try{
      anime.suspendWhenDocumentHidden = false;
      console.log('Fixing new travel');
    }
    catch(e){
      console.log(e);
    }

    function countTheStep(){
      stepCounter++;
      partyCheck();
      if(stepCounter == 9){
        stepCounter = 0;
        console.log('called');
        var item = {
          type: "updatePlayer",
        }
        window.postMessage(item);
        
      }

      var item = {
        type: "stepTaken",
      }
      window.postMessage(item);
    }

    function partyCheck(){
      if(Object.keys(document.getElementById('complete-travel-container')._x_dataStack[0].party).length > 0){
        var item = {
          type: "updateDiscordActivity",
          data: {
            state: 'Stepping in a Party [' + Object.keys(document.getElementById('complete-travel-container')._x_dataStack[0].party).length + '/4]',
          }
        }
        window.postMessage(item);
      }
      else{
        var item = {
          type: "updateDiscordActivity",
          data: {
            state: 'Stepping',
          }
        }
        window.postMessage(item);
      }
    }

    partyCheck();
    `;
  }

  if(url.includes('discussionboards/menu')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Discussion Boards',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('quests/viewall')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Quests',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('obs/viewall')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Jobs',
      }
    }
    window.postMessage(item);
    `;
  }


  if(url.includes('/crafting/menu')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Crafting Recipes',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('battle/menu')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Preparing for a Battle',
      }
    }
    window.postMessage(item);
    `;
  }
  

  //Use Item keybind config
  if(url == 'simple-mmo.com/travel' || url.includes('simple-mmo.com/npcs/attack/')){ //where to apply
    script += `
    function useQuickItemAjax(){
      $.ajax({
        type: 'POST',
        url: window.location.origin + 'api/quickuse',
        data: {'_token': document.querySelector('[name="csrf-token"]').content},
        dataType: 'json',
        success: function (data) {
          if (data.result == "success"){
            Swal.fire({
              type: 'success',
              title: 'Success!',
              html: data.message,
            });
            }else{
            Swal.fire({
              type: 'error',
              title: 'Failure',
              text: data.message,
            });
          }
        }
      });
    } 


    function useQuickItem(){
      fetch(window.location.origin + '/api/quickuse', {
        'method': 'POST',
        body: new URLSearchParams("_token="+document.querySelector('[name="csrf-token"]').content)
      })
      .then(response => response.json())
      .then(data => {
          if (data.result == "fail") {
            Swal.fire({
              type: 'error',
              title: 'Failure',
              text: data.message,
            });
          }
          else{
            Swal.fire({
              type: 'success',
              title: 'Success!',
              html: data.message,
            });
          }
      });
    }
    `;

  }




  return script;
}


const getRequiredScriptsAfter = async (url) => {
  var script = "";
  if(url.includes('simple-mmo.com/')){
    script += `
    function app(){
      if(!this||this==window)return new app;
      var o=function(){return"thanks for calling!"};
      return o.__proto__=app.prototype,o.constructor=app,o}
      app.prototype={
        openScrollableTabPage:function(title, menu){requiredAppFunction(title, menu);},
        openFixedTabPage:function(title, menu){requiredAppFunction(title, menu);},
      __proto__:Function.prototype
    },app=new app;


    
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
    `;
  }
  return script;
}




/* Additional functions */

function scrollUp(){
  sendToWindow('scrollUp')
}

function scrollDown(){
  sendToWindow('scrollDown')
}

function changeTheme(type){
  console.log("Changing theme to " + type);
  sendToWindow("changeTheme", type);
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

ipcRenderer.on("selectAll", () => {
  try{
    var items = document.querySelectorAll('[name="multi_item[]"]');
    for (let i = 0; i < items.length; i++) {
      const element = items[i];
      element.checked = true;
    }
  }
  catch(e){
    console.log(e);
  }
});

ipcRenderer.on("deselectAll", () => {
  try{
    var items = document.querySelectorAll('[name="multi_item[]"]');
    for (let i = 0; i < items.length; i++) {
      const element = items[i];
      element.checked = false;
    }
  }
  catch(e){
    console.log(e);
  }
});


