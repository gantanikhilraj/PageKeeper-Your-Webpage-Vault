chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({ tabs: [] });
  });
  
  function saveTab(url, title) {
    chrome.storage.sync.get('tabs', function(data) {
      var tabs = data.tabs || [];
      var tabData = {
        url: url,
        title: title,
      };
      tabs.push(tabData);
      chrome.storage.sync.set({ tabs: tabs }, function() {
        renderTabList();
      });
    });
  }
  
  function deleteTab(index) {
    chrome.storage.sync.get('tabs', function(data) {
      var tabs = data.tabs || [];
      tabs.splice(index, 1);
      chrome.storage.sync.set({ tabs: tabs }, function() {
        renderTabList();
      });
    });
  }

function renderTabList() {
    var tabList = document.getElementById('tabList');
    var noTabsMessage = document.getElementById('noTabsMessage');
  
    chrome.storage.sync.get('tabs', function(data) {
      var tabs = data.tabs || [];
  
      tabList.innerHTML = '';
      noTabsMessage.style.display = tabs.length === 0 ? 'block' : 'none';
  
      tabs.forEach(function(tabData, index) {
        var tabItem = document.createElement('li');
        tabItem.className = 'tabItem';
  
        var tabIcon = document.createElement('img');
        tabIcon.className = 'tabIcon';
        tabIcon.src = 'icons/icon16.png';
  
        var tabTitle = document.createElement('span');
        tabTitle.className = 'tabTitle';
        tabTitle.textContent = tabData.title;
  
        var deleteButton = document.createElement('button');
        deleteButton.className = 'deleteButton';
        deleteButton.textContent = 'Delete';
  
        deleteButton.addEventListener('click', function() {
          deleteTab(index);
        });
  
        tabItem.appendChild(tabIcon);
        tabItem.appendChild(tabTitle);
        tabItem.appendChild(deleteButton);
  
        tabList.appendChild(tabItem);
      });
    });
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    var tabInput = document.getElementById('tabInput');
    var saveTabButton = document.getElementById('saveTabButton');
    var errorText = document.getElementById('errorText');
  
    tabInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        saveTabButton.click();
      }
    });
  
    saveTabButton.addEventListener('click', function() {
      var url = tabInput.value.trim();
  
      if (url === '') {
        errorText.textContent = 'Please enter a URL.';
        return;
      }
  
      errorText.textContent = '';
  
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tab = tabs[0];
  
        if (tab && tab.url) {
          saveTab(tab.url, tab.title);
          tabInput.value = '';
        }
      });
    });
  
    renderTabList();
  });

  