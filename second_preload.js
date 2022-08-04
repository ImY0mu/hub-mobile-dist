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
    if(event.data.type == "openPage"){
      sendToWindow('openPage', event.data.url)
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
    if(event.data.type == "updateDiscordActivity"){
      console.log(event.data);
      sendToWindow('updateDiscordActivity', event.data)
    }
    if(event.data.type == "keybind"){
      sendToWindow('keybind', event.data.key)
    }
    if(event.data.type == "stepTaken"){
      sendToWindow('stepTaken', event.data.key)
    }
    if(event.data.type == "updatePlayer"){
      sendToWindow('updatePlayer')
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

  if(url.includes('user/view/')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Viewing Profile',
      }
    }
    window.postMessage(item);
    `;
  }


  if(url.includes('quests/view/')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Working on a Quest',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/collection/')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Collection',
      }
    }
    window.postMessage(item);
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

  if(url.includes('/inventory/items')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Inventory',
      }
    }
    window.postMessage(item);
    `;
  }


  if(url.includes('/inventory/storage')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Storage',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/inventory/showcase')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Showcase',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/tasks/viewall')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing Tasks',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/worldboss/all')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Browsing World Bosses',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/worldboss/view/')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Preparing for a World Boss',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('crafting/material/gather/')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Gathering ' + document.title,
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('crafting/view/')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Crafting ' + document.title,
      }
    }
    window.postMessage(item);
    `;
  }



  if(url.includes('npcs/attack/')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Slaying an NPC',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('user/attack/')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Attacking a Player',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/attack/')){
    script += `

    var client_settings = JSON.parse(localStorage.settings);
    
    function changeBars(){
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '.new_progress{width:100%;height:20px!important;border-radius:4px!important;background-image:linear-gradient(to bottom,rgba(255,255,255,.3),rgba(255,255,255,.05))!important; background-color: #831010 !important;}';
      style.innerHTML += '.progress-moved{padding:4px!important;border-radius:4px!important;background:rgba(0,0,0,.25)!important;box-shadow:inset 0 1px 2px rgb(0 0 0 / 25%),0 1px rgb(255 255 255 / 8%)!important}';
      style.innerHTML += '.apply_transition{transition:.4s linear!important;transition-property:width,background-color!important}';
      document.getElementsByTagName('head')[0].appendChild(style);

      document.querySelector('.character-container-new').style="gap:.5rem!important;padding:.5rem!important;"
      var width = document.querySelector('.playerHPBar').style.width;
      document.querySelector('.playerHPBar').style.width = "100%";
      document.querySelector('.playerHPBar').style.overflow = "hidden";
      document.querySelector('.playerHPBar').removeAttribute('class');
      document.querySelector('.playerHPBar').style = "transition: 0s;";
      document.querySelector('.playerHPBar').style.width = width;
      document.querySelector('.npcHPBar').style.transition = "0s";

      document.querySelector('.playerHPBar').setAttribute('id', 'playerHPBar');
      document.querySelector('.playerHPBar').classList.add('new_progress');
      document.querySelector('.npcHPBar').setAttribute('id', 'npcHPBar');
      document.querySelector('.npcHPBar').classList.add('new_progress');
      document.querySelector('.npcHPBar').parentElement.style.overflow = "hidden";

      setTimeout(() => {
        document.querySelector('#playerHPBar').classList.add('apply_transition');
        document.querySelector('#npcHPBar').classList.add('apply_transition');
      }, 25);


    }

    if(client_settings.mobile.ui_improvements){
      changeBars();
    }
    
    `;
  }

  if(url.includes('/worldboss/attack/')){
    script += `

    var client_settings = JSON.parse(localStorage.settings);
    
    function fixHeight(){
      document.querySelectorAll('.char-inner-container')[0].style.height = '80px';
    }

    if(client_settings.mobile.ui_improvements){
      fixHeight();
    }
    
    `;
  }

  //Use Item keybind config
  if(url == 'simple-mmo.com/travel' || url.includes('simple-mmo.com/npcs/attack/')){ //where to apply
    script += `
    function useQuickItemAjax(){
      $.ajax({
        type: 'POST',
        url: window.location.origin + '/api/quickuse',
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
      console.log('Travel opened in step mode.');

      var stepCounter = 0;


      function openPage(url){
        console.log(url);
  
        var pageUrl = window.location.href.split('simple-mmo.com')[0];
  
        var item = {
          type: "openPage",
          url:  pageUrl + 'simple-mmo.com' + url
        }
        window.postMessage(item);
      }
  
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
          partyCheck();
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

  if(url.includes('simple-mmo.com/inventory/storage')){ // inventory collect stuff
    script += `
    var names = [];

    function hidePopup(){
      setTimeout(() => {
        document.querySelector(".bg-gray-100.min-h-screen-smmo")._x_dataStack[0].show_popup = false;
      }, 25);
    }

    function showRemoveBtn(){
      var list = document.querySelectorAll('.flex.items-center.cursor-pointer');
      names = [];
      try{
        for(let i = 0; i < list.length; i++){
          var element = list[i];
          var name = element.querySelectorAll('.truncate .truncate span')[1].innerText;
          var src = element.querySelector('img').src;
          var type = element.querySelector('.text-gray-500.font-semibold.mr-4.text-xs.flex-grow.text-right.whitespace-nowrap').innerText;
          names.push(name);
          var quantity = element.querySelectorAll('.truncate .truncate span')[0].innerText;
          var id = element.getAttribute("id").split("item-")[1].split("-block")[0];
          console.log(id, JSON.stringify(quantity), getName(i), src)
          if(document.querySelectorAll("#collect-btn-" + id).length == 0){
            element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="removeFromStorage(' + id + ', \`' + getName(i) + '\`, \`' + src + '\`, \' + quantity + '\);  hidePopup();" class="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-800 mr-2">Remove</button>');
          }
        }
      }
      catch(e){
        console.error(e);
      }
    }

    function getName(index){
      return names[index];
    }
    `;
  }

  if(url.includes('simple-mmo.com/inventory/items')){ // inventory collect stuff
    script += `
    var names = [];


    function hidePopup(){
      setTimeout(() => {
        document.querySelector(".container-two .max-w-7xl.mx-auto")._x_dataStack[0].show_popup = false;
      }, 25);
    }

    function showUseBtn(){
      var list = document.querySelectorAll('.flex.items-center.cursor-pointer');
      names = [];
      try{
        for(let i = 0; i < list.length; i++){
          var element = list[i];
          var name = element.querySelectorAll('.truncate .ml-2.truncate .truncate span')[1].innerText;
          var src = element.querySelector('img').src;
          var type = element.querySelector('.text-gray-500.font-semibold.mr-4.text-xs.flex-grow.text-right.whitespace-nowrap').innerText;
          names.push(name);
          var quantity = element.querySelector('.truncate .ml-2.truncate .truncate').innerText.split(' ')[0].split('x')[1];
          var id = element.getAttribute("id").split("item-")[1].split("-block")[0];
          console.log(id, JSON.stringify(quantity), getName(i), src)
          if(document.querySelectorAll("#collect-btn-" + id).length == 0){
            if(type == 'Food'){
              element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="collection_collectables(' + id + ', \' + quantity + '\, \`' + getName(i) + '\`, \`' + src + '\`);  hidePopup();" class="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-800 mr-2">Collect</button>');
            }
            else if(type == 'Other'){
              //element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="addItemCollection(' + id + ', \' + quantity + '\, \`' + getName(i) + '\`, \`' + src + '\`);  hidePopup();" class="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-800 mr-2">Collect</button>');
            }
            else{
              //element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="addItemCollection(' + id + ', \' + quantity + '\, \`' + getName(i) + '\`, \`' + src + '\`);  hidePopup();" class="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-800 mr-2">Collect</button>');
            }
          }
        }
      }
      catch(e){
        console.error(e);
      }
    }



    function showCollectionBtn(){
      var list = document.querySelectorAll('.flex.items-center.cursor-pointer');
      names = [];
      try{
        for(let i = 0; i < list.length; i++){
          var element = list[i];
          var name = element.querySelectorAll('.truncate .ml-2.truncate .truncate span')[1].innerText;
          var src = element.querySelector('img').src;
          var type = element.querySelector('.text-gray-500.font-semibold.mr-4.text-xs.flex-grow.text-right.whitespace-nowrap').innerText;
          names.push(name);
          var quantity = element.querySelector('.truncate .ml-2.truncate .truncate').innerText.split(' ')[0].split('x')[1];
          var id = element.getAttribute("id").split("item-")[1].split("-block")[0];
          console.log(id, JSON.stringify(quantity), getName(i), src)
          if(document.querySelectorAll("#collect-btn-" + id).length == 0){
            if(type == 'Collectable'){
              element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="collection_collectables(' + id + ', \' + quantity + '\, \`' + getName(i) + '\`, \`' + src + '\`);  hidePopup();" class="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-800 mr-2">Collect</button>');
            }
            else if(type == 'Other'){
              //element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="addItemCollection(' + id + ', \' + quantity + '\, \`' + getName(i) + '\`, \`' + src + '\`);  hidePopup();" class="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-800 mr-2">Collect</button>');
            }
            else{
              element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="addItemCollection(' + id + ', \' + quantity + '\, \`' + getName(i) + '\`, \`' + src + '\`);  hidePopup();" class="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-800 mr-2">Collect</button>');
            }
          }
        }
      }
      catch(e){
        console.error(e);
      }
    }

    function getName(index){
      return names[index];
    }
    `;
  }

  if(url == 'simple-mmo.com/guilds/view/474'){ // add supporter tag to guild
    var icon = 'http://localhost:8081/patreon/star.png';
    //document.querySelector('.container-two .max-w-7xl.mx-auto .text-center').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 mt-1 text-indigo-800"><img class="w-4 h-4 mr-1" src="' + icon + '" /><span class="mt-0.5">Patreon Supporters</span></span></div>');
  }

  if(url.includes('simple-mmo.com/temple')){
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
        console.table(patreons);
        Object.keys(patreons).forEach(function (k) {
          if(patreons[k].user_id == userID) {
            console.log('In the list');
            if(patreons[k].icon == '') {
              if(patreons[k].tier == 3){
                var icon = 'http://localhost:8081/patreon/ruby_diamond.png';
                document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center pl-1 pr-3 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 mt-1 text-gray-900 border border-gray-300"><img class="w-6 h-6" src="' + icon + '" /><span class="ml-1">Patreon Supporter</span></span></div>');
              }
              else if(patreons[k].tier == 2){
                var icon = 'http://localhost:8081/patreon/green_diamond.png';
                document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center pl-1 pr-3 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 mt-1 text-gray-900 border border-gray-300"><img class="w-6 h-6" src="' + icon + '" /><span class="ml-1">Patreon Supporter</span></span></div>');
                
              }
              else if(patreons[k].tier == 1){
                var icon = 'http://localhost:8081/patreon/blue_diamond.png';
                document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center pl-1 pr-3 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 mt-1 text-gray-900 border border-gray-300"><img class="w-6 h-6" src="' + icon + '" /><span class="ml-1">Patreon Supporter</span></span></div>');
              }
            }
            else{
              if(patreons[k].icon != '') var icon = 'http://localhost:8081/patreon/' + patreons[k].icon.replace('http://y0mu.mablog.eu/patreon_images/', '');
              document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center pl-1 pr-3 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 mt-1 text-gray-900 border border-gray-300"><img class="w-6 h-6" src="' + icon + '" /><span class="ml-1">Patreon Supporter</span></span></div>');
            }
          }
        });
      }
      isPatreon();
    `;

    if(url == 'simple-mmo.com/user/view/5944'){
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
  if(url.includes('simple-mmo.com/')){
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

  if(url.includes('simple-mmo.com/item/customise/')){
    script += `
      try{
        eval(changeSprite.toString().replace(' $("#change-sprite-warning").show();', "document.querySelector('#change-sprite-warning').style.display = '';"));
      }
      catch(e){
        console.log(e);
      }
    `;
  }

  if(url.includes('simple-mmo.com/inventory/items')){ // inventory collect stuff
    script += `
    eval(addItemCollection.toString().replace("inputValue: '1',", "inputValue: qty,"));
    eval(collection_collectables.toString().replace("inputValue: '1',", "inputValue: qty,"));
    `;
  }

  if(url.includes('simple-mmo.com/inventory/storage')){ // inventory collect stuff
    script += `
    eval(removeFromStorage.toString().replace("inputValue: '1',", "inputValue: max_amount,"));
    eval(removeFromStorage.toString().replace("atob(name)", "name"));
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

  if(url.includes('simple-mmo.com/temple')){
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


/* Additional functions */
