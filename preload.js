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

  document.addEventListener(
				"auxclick",
				function (e) {
					e.preventDefault();
				},
				false
			);

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
    if(event.data.name == "end_timer"){
      console.log('Ended the timer!');
      sendToWindow('end_timer', event.data);
    }
    if(event.data.type == "updateDiscordActivity"){
      console.log(event.data);
      sendToWindow('updateDiscordActivity', event.data)
    }
    if(event.data.type == "takeStep"){
      sendToWindow('takeStep', event.data.key)
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
        styles = "::-webkit-scrollbar {width: 8px;} ::-webkit-scrollbar-thumb {background: rgba(30, 30, 30, 1);} ::-webkit-scrollbar-thumb:hover {background: rgba(22, 22, 22, 1);} ::-webkit-scrollbar-track {background: rgb(50, 50, 50);}";
      } 
      else{
        styles = "::-webkit-scrollbar {width: 8px;} ::-webkit-scrollbar-thumb {background: rgba(180, 180, 180, 1);} ::-webkit-scrollbar-thumb:hover {background: rgba(200, 200, 200, 1);} ::-webkit-scrollbar-track {background: rgb(220, 220, 220);}";
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
      document.addEventListener(
				"auxclick",
				function (e) {
					e.preventDefault();
					//self.keyBindListener(e);
				},
				false
			);
      window.addEventListener('mousedown', function(e){
        if(e.button == 1){
          e.preventDefault();
        }
        self.keyBindListener(e);
      }, false);
      
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

    var is_pet_ui = false;
    var return_pet_back = false;

    function petUiController(on_page_load = false){
      if(on_page_load) is_pet_ui = localStorage.getItem('is_pet_ui') === 'true';
      if(!is_pet_ui && on_page_load) return;
      if(is_pet_ui && on_page_load) is_pet_ui = false;

      if(!is_pet_ui){

        if(!on_page_load){
          localStorage.setItem('is_pet_ui', true);
        }

        return showPetUI();
      }

      
      localStorage.setItem('is_pet_ui', false);

      return hidePetUI();
    }

    petUiController(true);
    
    function hidePetUI(){
      is_pet_ui = false;
     
      
      document.getElementById('complete-travel-container').querySelector('div[class="text-center mt-4 mb-2 flex item-center justify-center gap-2"]').remove();

      // Revert avatar
      document.querySelector('img[class="h-10 hidden"]').classList.remove('hidden');
      
      // Revert padding
      document.getElementById('complete-travel-container').querySelector('div[class="p-1"]').setAttribute('class', 'p-4');

      // Revert marging
      document.getElementById('complete-travel-container').querySelector('div[class="ml-1 w-0 flex-1 pt-0.5"]').setAttribute('class', 'ml-3 w-0 flex-1 pt-0.5')

    }

    function showPetUI(){
      is_pet_ui = true;
      
      var avatar_url = document.getElementById('complete-travel-container')._x_dataStack[0].user.avatar;
      var pet_url = document.getElementById('complete-travel-container')._x_dataStack[0].user.pet;

      // Remove avatar
      document.querySelector('img[class="h-10"]').classList.add('hidden');

      // Fix padding
      document.getElementById('complete-travel-container').querySelector('div[class="p-4"]').setAttribute('class', 'p-1');

      // Remove marging
      document.getElementById('complete-travel-container').querySelector('div[class="ml-3 w-0 flex-1 pt-0.5"]').setAttribute('class', 'ml-1 w-0 flex-1 pt-0.5')

      var modifiers_element = document.getElementById('complete-travel-container').querySelector('div[class="text-center mt-2"]');

      modifiers_element.insertAdjacentHTML('beforeBegin', '<div class="text-center mt-4 mb-2 flex item-center justify-center gap-2"><img id="avatar" class="h-12" src="' + avatar_url + '"><img id="pet" class="h-10" src="' +  pet_url + '"></div>');
    }

    function animateStep(){
      if(!is_pet_ui) return;

      anime({
        targets: '#avatar',
        translateY: [0, -8, 0, -8, 0, -8, 0, -8, 0, -8, 0, -8, 0],
        duration: 5000,
        easing: 'linear'
      });

      var rand = Math.floor(Math.random() * 100);
      console.log(rand);

      if(return_pet_back){
        anime({
          targets: '#pet',
          translateY: [0, -8, 0, -8, 0, -8, 0, -8, 0, -8, 0, -8, 0],
          translateX:['100vw', 0],
          duration: 5000,
          delay: 300,
          easing: 'linear'
        });

        return_pet_back = false;

        return;
      }

      if(rand >= 99){
        anime({
          targets: '#pet',
          translateY: [0, -8, 0, -8, 0, -8, 0, -8, 0, -8, 0, -8, 0],
          translateX: [0, '100vw'],
          duration: 5000,
          delay: 300,
          easing: 'linear'
        });

        return_pet_back = true;

        return;
      }

      anime({
        targets: '#pet',
        translateY: [0, -8, 0, -8, 0, -8, 0, -8, 0, -8, 0, -8, 0],
        duration: 5000,
        delay: 300,
        easing: 'linear'
      });
    }

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
      console.log("Drunk the potion of " + potions[selected_potion].type + "(" + potions[selected_potion].percentage + "%)" + " for " + potions[selected_potion].value + " minutes");
      
      
      let item = {
        name: 'create_timer', 
        type: 'buff',
        data: {
          type: 'potion',
          name: potions[selected_potion].type,
          percentage: potions[selected_potion].percentage,
          value: potions[selected_potion].value,
        },
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

      console.log("Starting the sprint for " + value + " minutes");

      if(value > current_energy) return console.error('You do not have enough energy to do this.');
      
      let item = {
        name: 'create_timer', 
        type: 'buff',
        data: {
          type: 'sprint',
          name: '',
          value: value,
        },
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

    const injectCSS = css => {
      let el = document.createElement('style');
      el.type = 'text/css';
      el.innerText = css;
      document.head.appendChild(el);
      return el;
    };
    
    injectCSS('.disabled{ pointer-events: none; opacity: 30%; }');

    function fallingLeaves(){
      injectCSS('.leaf_container{ position:fixed; top: 0; left: 0; z-index: 1; pointer-events: none; min-height: 100vh; min-width: 100vw;}.leaf,.leaf div{position:absolute}.leaf{width:100%;height:100%;top:0;left:0}.leaf div{display:block}.leaf div:first-child{left:20%;animation:15s linear -6s infinite fall}.leaf div:nth-child(2){left:70%;animation:15s linear -8s infinite fall}.leaf div:nth-child(3){left:10%;animation:20s linear -7s infinite fall}.leaf div:nth-child(4){left:50%;animation:18s linear -10s infinite fall}.leaf div:nth-child(5){left:85%;animation:14s linear -16s infinite fall}.leaf div:nth-child(6){left:65%;animation:16s linear -12s infinite fall}.leaf div:nth-child(7){left:90%;animation:15s linear -8s infinite fall}.leaf div:nth-child(8){left:70%;animation:15s linear -6s infinite fall}.leaf div:nth-child(9){left:40%;animation:15s linear -9s infinite fall}.leaf div:nth-child(10){left:30%;animation:13s linear -9s infinite fall}.leaf div:nth-child(11){left:75%;animation:16s linear -8s infinite fall}.leaf div:nth-child(12){left:45%;animation:18s linear -12s infinite fall}@keyframes fall{0%{opacity:1;top:-10%;transform:rotate(0)}20%{opacity:.8;transform:rotate(45deg)}40%{transform:(90deg)}60%{transform:rotate(135deg)}80%{transform:rotate(180deg)}100%{opacity:.5;top:110%;transform:(225deg)}}');

      var html = '<div class="leaf_container"><div class="leaf"><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div><div><img src="https://web.simple-mmo.com/img/icons/rsz_leaf.png"></div></div></div>';
      
      
      document.querySelector('.notyf').insertAdjacentHTML('beforebegin', html);
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

                    // Commented out as it broke new ghost step fix.
                    try{
                      //button.setAttribute('x-on:click', 'clicked=true;' + button.getAttribute('x-on:click').split(';')[1].replace('document.location=', 'openPage(').replace("?new_page=true'", "?new_page=true')"));
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

                      if(button.innerText == 'Attack'){
                        button.setAttribute('onclick', "openPage('" + link + "'); event.target.classList.add('disabled'); event.target.parentElement.children[1].classList.add('disabled')");
                      }
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
      var value = document.querySelectorAll('#step_button')[0].attributes['x-on:mousedown'].nodeValue;

      if(!value.endsWith(';')){
        value += ';';
      }

      document.querySelectorAll('#step_button')[0].attributes['x-on:mousedown'].nodeValue =  value + " countTheStep();";
    }
    catch(e){
      console.log(e);
    }

    try{
      var value = document.querySelectorAll('#step_button')[1].attributes['x-on:mousedown'].nodeValue;

      if(!value.endsWith(';')){
        value += ';';
      }

      document.querySelectorAll('#step_button')[1].attributes['x-on:mousedown'].nodeValue =  value + " countTheStep();";
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
      animateStep();
      if(stepCounter == 9){
        stepCounter = 0;
        console.log('called');
        var item = {
          type: "updatePlayer",
        }
        window.postMessage(item);
        
      }

      var item = {
        type: "takeStep",
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

  if(url.includes('jobs/viewall')){
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
  
  if(url.includes('/crafting/menu')){
    script += `
    var last_expiry_time = 0;

    function checkIfThereIsOngoingCrafting(){
      var data = document.querySelector('.container-two').querySelector('.max-w-7xl.mx-auto .min-h-screen-smmo.bg-gray-100 div.px-2.pt-2 div div')._x_dataStack[0];
      if(data.current_crafting_session.complete)
        return endCraftingTimer();

      var new_expiry_time = data.current_crafting_session.expiry_time;
      if(last_expiry_time != new_expiry_time){
        last_expiry_time = new_expiry_time;
        console.log('new timer!');
        return createCraftingTimer(last_expiry_time);
      }
    }

    function createCraftingTimer(end){
      console.log(end);

      let item = {
        name: 'create_timer', 
        type: 'timer',
        data: {
          type: 'crafting',
          name: 'Crafting',
        },
        end: end
      };
      

      window.postMessage(item);
    }

    function endCraftingTimer(){
			console.log("called");

      let item = {
        name: 'end_timer', 
        type: 'timer',
        data: {
          type: 'crafting',
          name: 'Crafting',
        },
        end: null
      };
      

      window.postMessage(item);
    }
    

    setInterval(() => {
      checkIfThereIsOngoingCrafting();
    }, 1000);
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

  if( url.includes('simple-mmo.com/npcs/attack/') || url.includes('simple-mmo.com/user/attack/')){
    script += `
      var is_bg_hidden = false;
      var original_bg = '';
  
      function hideBackground(){
        if(!is_bg_hidden){
          try{
            is_bg_hidden = true;
            original_bg = document.querySelector('div.rounded-lg.h-screen.bg-opacity-20').style.background.style.background;
            return document.querySelector('div.rounded-lg.h-screen.bg-opacity-20').style.background = '';;
          }
          catch(e){
            return console.error(e);
          }
        }
        is_bg_hidden = false;
        document.querySelector('div.rounded-lg.h-screen.bg-opacity-20').style.background.style.background = original_bg;
  
      }
    `;
  }

  if(url.includes('simple-mmo.com/user/attack/')){
    script += `
      function hideBackground(){
        try{
          document.querySelector('div.attackbg').style.background = 'transparent';
          
          setTimeout(() => { 
            document.querySelector('div.attackbg').style.background = 'transparent'; 
          }, 100);
        }
        catch(e){
          console.error(e);
        }
      }
    `;
  }

  //Use Item keybind config
  if(url.includes('simple-mmo.com/travel') || url.includes('simple-mmo.com/npcs/attack/')){ //where to apply
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


