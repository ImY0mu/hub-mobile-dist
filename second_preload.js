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


  document.addEventListener(
    "auxclick",
    function (e) {
      e.preventDefault();
    },
    false
  );

  
  window.addEventListener("message", function(event) {
    console.log(event.data);
    if(event.data == "closeWindow"){
      sendToWindow('closeWindow')
    }
    if(event.data.name == "openPage"){
      sendToWindow('openPage', event.data.url)
    }
    if(event.data == "updatePlayer"){
      sendToWindow('updatePlayer')
    }
    if(event.data.name == "create_timer"){
      console.log('Started the timer!');
      sendToWindow('create_timer', event.data);
    }
    if(event.data.name == "openPageWithSubMenu"){
      sendToWindow('openPageWithSubMenu', event.data)
    }
    if(event.data.name == "updateDiscordActivity"){
      console.log(event.data);
      sendToWindow('updateDiscordActivity', event.data)
    }
    if(event.data.name == "keybind"){
      sendToWindow('keybind', event.data.key)
    }
    if(event.data.name == "stepTaken"){
      sendToWindow('stepTaken', event.data.key)
    }
    if(event.data.name == "updatePlayer"){
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
      //window.postMessage('updatePlayer');
    }



    function requiredAppFunction(title, menu){
      try{
        console.log(JSON.parse(menu));
      }
      catch(e){
        console.log(menu);
      }
      
      let item = {
        name: "openPageWithSubMenu", 
        title: title, menu: menu
      }; 
      window.postMessage(item);
    }


    function keybind(key){
      var item = {
        name: "keybind",
        key: key
      }
      window.postMessage(item);
    }

    var keyBindListener = function (e){
      console.log(e);
      var pressedKey = "";
      if(e.type == "mousedown"){
        if(e.button != 0 && e.button != 2){
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
      window.addEventListener('mousedown', function(e){
        if(e.button == 1){
          e.preventDefault();
        }
        self.keyBindListener(e);
      }, false);
      document.addEventListener(
				"auxclick",
				function (e) {
					e.preventDefault();
				},
				false
			);
    }
    catch (error) {
      console.log(error);
    }
  `;
  }

  if(url.includes('user/view/')){
    script += `
    var item = {
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
      data: {
        state: 'Crafting ' + document.title,
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/market-menu')){
    script += `
    var item = {
      name: "updateDiscordActivity",
      data: {
        state: 'Browsing Market',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.endsWith('/town')){
    script += `
    var item = {
      name: "updateDiscordActivity",
      data: {
        state: 'Visiting a town',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/bank')){
    script += `
    var item = {
      type: "updateDiscordActivity",
      data: {
        state: 'Visiting a bank',
      }
    }
    window.postMessage(item);
    `;
  }

  if(url.includes('/shop/viewall')){
    script += `
    var item = {
      name: "updateDiscordActivity",
      data: {
        state: 'Visiting a shop',
      }
    }
    window.postMessage(item);
    `;
  }



  if(url.includes('npcs/attack/')){
    script += `
    var item = {
      name: "updateDiscordActivity",
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
      name: "updateDiscordActivity",
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
    
    function improve_action_buttons(){
      try {
        var btnUI = document.querySelector('.flex.justify-center.gap-2.flex-wrap.mt-2');
        btnUI.className = 'grid grid-cols-2 justify-center gap-2 mt-2';
        var buttons = btnUI.querySelectorAll('button');

        var UI = document.querySelector('.flex.justify-center.items-center.flex-wrap.gap-2');
        UI.className = 'flex justify-center items-center flex-wrap gap-2';
        UI.style = 'height: 60vh;';


        buttons.forEach(element => {
          element.classList.add('justify-center');
        });
      } catch (error) {
        
      }
    }

    function set_for_lower_resolution(){
      try{
        var avatars = document.querySelectorAll('.flex.flex-col.items-center.justify-center.h-32');

        avatars.forEach(element => {
          element.classList.remove('h-32');
          element.classList.add('h-24');
        });
      } catch (error) {
          
      }
    }

    if(client_settings.mobile.ui_improvements){
      improve_action_buttons();
    }

    if(client_settings.mobile.ui_ba_small_window){
      set_for_lower_resolution();
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

  if(url.includes('simple-mmo.com/travel')){
    script += `
    var is_bg_hidden = localStorage.getItem('is_bg_hidden') === 'true';
    var original_bg = null;

    function hideBackground(on_page_load = false){
      if(!on_page_load) is_bg_hidden = localStorage.getItem('is_bg_hidden') === 'true';
      if(!is_bg_hidden && on_page_load) return;
      if(is_bg_hidden && on_page_load) is_bg_hidden = false;

      if(!is_bg_hidden){
        try{
          if(!on_page_load){
            localStorage.setItem('is_bg_hidden', true);
          }

          is_bg_hidden = true;
          original_bg = document.querySelector('#complete-travel-container').querySelector('div.relative').style.background;
          return document.querySelector('#complete-travel-container').querySelector('div.relative').style.background = '';
        }
        catch(e){
          return console.error(e);
        }
      }
      if(!on_page_load){
        localStorage.setItem('is_bg_hidden', false);
      }
      is_bg_hidden = false;
      document.querySelector('#complete-travel-container').querySelector('div.relative').style.background = original_bg;

    }

    hideBackground(true);
    `;
  }

  if( url.includes('simple-mmo.com/npcs/attack/')){
    script += `
    var is_bg_hidden = localStorage.getItem('is_bg_hidden') === 'true';
    var original_bg = null;

    function hideBackground(on_page_load = false){
      if(!on_page_load) is_bg_hidden = localStorage.getItem('is_bg_hidden') === 'true';
      if(!is_bg_hidden && on_page_load) return;
      if(is_bg_hidden && on_page_load) is_bg_hidden = false;

      if(!is_bg_hidden){
        try{
          if(!on_page_load){
            localStorage.setItem('is_bg_hidden', true);
          }

          is_bg_hidden = true;
          original_bg = document.querySelector('div.rounded-lg.h-screen.bg-opacity-20').style.background;
          return document.querySelector('div.rounded-lg.h-screen.bg-opacity-20').style.background = '';
        }
        catch(e){
          return console.error(e);
        }
      }

      if(!on_page_load){
        localStorage.setItem('is_bg_hidden', false);
      }
      is_bg_hidden = false;
      document.querySelector('div.rounded-lg.h-screen.bg-opacity-20').style.background = original_bg;

    }

    hideBackground(true);
    `;
  }

  if(url.includes('simple-mmo.com/user/attack/')){
    script += `

    var is_bg_hidden = localStorage.getItem('is_bg_hidden') === 'true';
    var original_bg = null;

    function hideBackground(on_page_load = false){
      if(!on_page_load) is_bg_hidden = localStorage.getItem('is_bg_hidden') === 'true';
      if(!is_bg_hidden && on_page_load) return;
      if(is_bg_hidden && on_page_load) is_bg_hidden = false;

      if(!is_bg_hidden){
        try{
          if(!on_page_load){
            localStorage.setItem('is_bg_hidden', true);
          }

          is_bg_hidden = true;
          original_bg = document.querySelector('div.attackbg').style.background = '';
          return document.querySelector('div.attackbg').style.background = 'transparent';
        }
        catch(e){
          return console.error(e);
        }
      }
      if(!on_page_load){
        localStorage.setItem('is_bg_hidden', false);
      }
      is_bg_hidden = false;
      document.querySelector('div.attackbg').style.background = original_bg;

    }

    hideBackground(true);
    `;
  }

  //Use Item keybind config
  if(url.includes('simple-mmo.com/travel') || url.includes('simple-mmo.com/npcs/attack/')){ //where to apply
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

  if(url.includes('simple-mmo.com/podcast')){
    script += `
    function fixLinks(){
      var links = document.querySelectorAll('a');
      for(i = 0; i < links.length; i++){
        links[i].removeAttribute('target')
      }
    }
    fixLinks();
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

    function updateListingQty(val) {
      //document.getElementById('qty_listing_amount').innerHTML=val; 
    }

    function makeid(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    function fixMissingStylesAtPopup(){
      var styles = ".smmo-switch{position:relative;display:inline-block;width:40px;height:25px}.smmo-switch input{opacity:0;width:0;height:0}.smmo-slider.round{border-radius:34px}.smmo-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;-webkit-transition:.4s;transition:.4s}.mt-10{margin-top:10px}[type=checkbox]{border-radius:0}[type=checkbox],[type=radio]{-webkit-appearance:none;-moz-appearance:none;appearance:none;padding:0;-webkit-print-color-adjust:exact;color-adjust:exact;display:inline-block;vertical-align:middle;background-origin:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;flex-shrink:0;height:1rem;width:1rem;color:#2563eb;background-color:#fff;border-color:#737373;border-width:1px;--tw-shadow:0 0 #0000}.smmo-slider.round:before{border-radius:50%}.smmo-slider::before{background-color:var(--widget)}.smmo-slider:before{position:absolute;content:'';height:15px;width:15px;left:4px;bottom:4px;background-color:#fff;-webkit-transition:.4s;transition:.4s}";
      var styleSheet = document.createElement("style")
      styleSheet.type = "text/css"
      styleSheet.innerText = styles
      document.head.appendChild(styleSheet)

      var button = '<button type="button" onclick="marketSellItem();" class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Place on Market</button>';

      try {
        document.querySelector('#item-popup').querySelector('.flex.flex-wrap.justify-center.gap-2.my-4').insertAdjacentHTML('beforeend', button);
      } catch (error) {
        console.log(error);
      }
    }

    fixMissingStylesAtPopup();
    
    function marketSellItem(){

      var id = document.querySelector('#item-popup')._x_dataStack[0].item.id;
      var name = document.querySelector('#item-popup')._x_dataStack[0].item.name;
      var image = document.querySelector('#item-popup')._x_dataStack[0].item.image;
      var max_amount = document.querySelector('#item-popup')._x_dataStack[0].item.yours;

      var existing_qty = $("#item-"+id+"-qty").html();
      var new_qty = 1;
      var is_bank_payment = false;

      var existing_qty_max = existing_qty;
      if (existing_qty_max > 50)
        existing_qty_max = 50;

      var average_price = "<i class='fa fa-sync fa-spin'></i> Loading";
      var lowest_price = "<i class='fa fa-sync fa-spin'></i> Loading";
      var highest_price = "<i class='fa fa-sync fa-spin'></i> Loading";
      var average_id = makeid(5);
      var lowest_id = makeid(5);
      var highest_id = makeid(5);

      if (max_amount > 20)
        max_amount = 20;

      //Get prices
        $.ajax({
            type: "POST",
            url: '/api/market/'+id+'/prices',
            success: function( data ) {
                average_price = data.average_price;
                $("#average-price-"+id+"-"+average_id).html("<img src='/img/icons/I_GoldCoin.png' class='h-4'> "+average_price);

                lowest_price = data.lowest_price;
                $("#lowest-price-"+id+"-"+lowest_id).html("<img src='/img/icons/I_GoldCoin.png' class='h-4'> "+lowest_price);

                highest_price = data.highest_price;
                $("#highest-price-"+id+"-"+highest_id).html("<img src='/img/icons/I_GoldCoin.png' class='h-4'> "+highest_price);
            }
        });

      var previous_prices = "Average price: <span id='average-price-"+id+"-"+average_id+"'>"+average_price+"</span><br/>"+
      "Lowest price: <span id='lowest-price-"+id+"-"+lowest_id+"'>"+lowest_price+"</span><br/>"+
      "Highest price: <span id='highest-price-"+id+"-"+highest_id+"'>"+highest_price+"</span><br/>"+
      "<small>in the past 30 days</small>";


      var moneyToBank = "<div class=''><strong>Place gold in bank</strong><br><label class='smmo-switch mt-10'><input type='checkbox' name='bank_payment' id='bank_payment'><span class='smmo-slider round'></span></label><br><small>+2.5% fee</small></div>";


      Swal.fire({
        title: 'Sell '+ name,
        imageUrl: image,
        html: previous_prices+"<br/><Br/><small>All final transactions have a 3.5% fee.</small>"+
  "<br/><br/><strong>Quantity</strong><br/>"+
  "<input type='number' min='0' max='"+max_amount+"'  oninput='updateListingQty(this.value);' onchange='updateListingQty(this.value);' id='swal-input1' name='amount' class='swal2-input'><br/>"+
  "<small>You can only list 20 items at one time.</small><Br/><br/>"+
  "<strong>Amount</strong><br/><input type='text' inputmode='numeric' onkeyup='formatInputNumber(this);' id='swal-input2' name='quantity' class='gold-input-icon swal2-input'><br/>"+moneyToBank,
        showCancelButton: true,
        confirmButtonText: 'Sell item',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          new_qty = document.getElementById('swal-input1').value;
          
          if($('#bank_payment').is(':checked'))
            is_bank_payment = true;
          
          return fetch('/api/market/'+id, {
              'method': 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({_token: token, qty: document.getElementById('swal-input1').value, amount: document.getElementById('swal-input2').value, bank_payment: is_bank_payment})
            })
            .then(response => {
              if (!response.ok) {

                if(response.status == 429){
                    throw new Error("You are listing items on the market too fast. Please wait a few moments before trying again. ");
                }
                
                throw new Error(response.statusText)
              }
              return response.json()
            })
            .catch(error => {
              Swal.showValidationMessage(
                error
              )
            })
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.value) {
          Swal.fire({
            title: result.value.title,
            html: result.value.result,
            type: result.value.type
          });

          if (result.value.type == "success"){
            var new_qty_two = existing_qty - new_qty;
            if (new_qty_two < 1){
              $("#item-"+id+"-block").hide();
            }else{
              $("#item-"+id+"-qty").html(new_qty_two);
            }
          }
        }
      });
  }

    `;

    script += `
      console.log('Travel opened in step mode.');

      var stepCounter = 0;

      var potions = [];

    var selected_potion = null;

    function prepare_potions(){
      var links = document.querySelector('[x-show="potions_dropdown"]').querySelectorAll('a');
      try {
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
      } catch (error) {
        console.log(error);
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
          name: "openPage",
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
        document.querySelectorAll('#step_button')[0].attributes['x-on:mousedown'].nodeValue = "takeStep; countTheStep();";
      }
      catch(e){
        console.log(e);
      }

      try{
        document.querySelectorAll('#step_button')[1].attributes['x-on:mousedown'].nodeValue = "takeStep; countTheStep();";
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
            name: "updatePlayer",
          }
          window.postMessage(item);
          partyCheck();
        }

        var item = {
          name: "stepTaken",
        }
        window.postMessage(item);
      }


      function partyCheck(){
        if(Object.keys(document.getElementById('complete-travel-container')._x_dataStack[0].party).length > 0){
          var item = {
            name: "updateDiscordActivity",
            data: {
              state: 'Stepping in a Party [' + Object.keys(document.getElementById('complete-travel-container')._x_dataStack[0].party).length + '/4]',
            }
          }
          window.postMessage(item);
        }
        else{
          var item = {
            name: "updateDiscordActivity",
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
            element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="removeFromStorage(' + id + '); hidePopup();" class="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-800 mr-2">Remove</button>');
          }
        }
      }
      catch(e){
        console.error(e);
      }
    }

    function removeFromStorage(id){
      window.location.href = "/inventory/action/store/" + id + "?option=remove&new_page=true";;
    }

    function getName(index){
      return names[index];
    }
    `;
  }

  if(url.includes('simple-mmo.com/inventory/items')){ // inventory collect stuff
    script += `
    var names = [];

    // var item = null;
    // function prepare_item(){
    //   item = document.querySelector('main div.container-two div.max-w-7xl.mx-auto')._x_dataStack[0].item;
    //   console.log(item);
    // }

    // function showItemPopup(){
    //   console.log('called');
    //   prepare_item();
    // }

    // showItemPopup();


    function hidePopup(){
      setTimeout(() => {
        document.querySelector(".container-two .max-w-7xl.mx-auto")._x_dataStack[0].show_popup = false;
      }, 25);
    }

    function showStorageBtn(){
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
            element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="addToStorage(' + id + '); hidePopup();" class="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-red-800 mr-2">Store</button>');
          }
        }
      }
      catch(e){
        console.error(e);
      }
    }

    function addToStorage(id){
      window.location.href = "/inventory/action/store/" + id + "?option=add&new_page=true";;
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
            else if(type == 'Food'){
              //element.insertAdjacentHTML('beforeend', '<button id="collect-btn-' + id + '" onclick="addItemCollection(' + id + ', \' + quantity + '\, \`' + getName(i) + '\`, \`' + src + '\`);  hidePopup();" class="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-800 mr-2">Collect</button>');
            }
            else if(type == 'Material'){
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
    function templeTimer(god){
      console.log(god.toLocaleLowerCase());

      let item = {
        name: 'create_timer', 
        data: {
          type: 'temple',
          name: god.toLocaleLowerCase()
        },
        value: 60,
        end: null
      }; 

      window.postMessage(item);
      
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

        const patreon = patreons.find((patreon) => patreon.user_id == userID);

        if(patreon == null) return console.log('Not a patreon');
        switch (patreon.tier) {
          case 1:
            var icon = 'http://localhost:8081/patreon/blue_diamond.png';
            document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center pl-1 pr-3 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 mt-1 text-gray-900 border border-gray-300"><img class="w-6 h-6" src="' + icon + '" /><span class="ml-1">Patreon Supporter</span></span></div>');
            break;
          case 2:
            var icon = 'http://localhost:8081/patreon/green_diamond.png';
            document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center pl-1 pr-3 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 mt-1 text-gray-900 border border-gray-300"><img class="w-6 h-6" src="' + icon + '" /><span class="ml-1">Patreon Supporter</span></span></div>');
            break;
          case 3:
            var icon = 'http://localhost:8081/patreon/ruby_diamond.png';
            document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center pl-1 pr-3 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 mt-1 text-gray-900 border border-gray-300"><img class="w-6 h-6" src="' + icon + '" /><span class="ml-1">Patreon Supporter</span></span></div>');
            break;
          default:
            if(patreons[k].icon != '') var icon = 'http://localhost:8081/patreon/' + patreons[k].icon.replace('http://y0mu.mablog.eu/patreon_images/', '');
            document.querySelector('.container-two .max-w-7xl.mx-auto .text-center.pt-16').insertAdjacentHTML('beforeend', '<div><span class="inline-flex items-center justify-center pl-1 pr-3 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 mt-1 text-gray-900 border border-gray-300"><img class="w-6 h-6" src="' + icon + '" /><span class="ml-1">Patreon Supporter</span></span></div>');
            break;
        }
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
    eval(addItemCollection.toString().replace("title: name,", "title: name, inputValue: qty,"));
    eval(collection_collectables.toString().replace("title: name,", "title: name, inputValue: qty,"));
    `;
  }

  if(url.includes('simple-mmo.com/inventory/storage')){ // inventory collect stuff
    script += `
    //removed
    // eval(removeFromStorage.toString().replace("inputValue: '1',", "inputValue: max_amount,"));
    // eval(removeFromStorage.toString().replace("atob(name)", "name"));
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
        .replace('if (result.value) {', 'if (result.value) { templeTimer(god);')
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
