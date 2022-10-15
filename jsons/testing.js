var quests = [];

function get_quests(){
  const listOfQuests = document.querySelector('[role=list]').querySelectorAll('li');
  
  for (let i = 0; i < listOfQuests.length; i++) {
    const element = listOfQuests[i];
    const quest = {
      image: element.querySelector('img').src.replace('web.', ''),
      title: encodeURI(element.querySelector('p.text-xs.font-medium.text-gray-900.truncate').innerText.trim()),
      description: null,
      required_dexterity: null,
      level: parseInt(element.querySelector('p.text-xs.text-gray-500.truncate').innerText.split('Level')[1].trim()),
      id: parseInt(element.getAttribute('onclick').split("window.location='/quests/view/")[1].split("?new_page_refresh=true'")[0].trim()),
      link: 'simple-mmo.com' + element.getAttribute('onclick').split("window.location='")[1].split("?new_page_refresh=true'")[0].trim()
    }
    quests.push(quest);
  }

  console.log(quests);
}

get_quests();