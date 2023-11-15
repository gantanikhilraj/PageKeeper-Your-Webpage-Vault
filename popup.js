document.addEventListener('DOMContentLoaded', function() {
  var tabInput = document.getElementById('tabInput');
  var saveTabButton = document.getElementById('saveTabButton');
  var tabList = document.getElementById('tabList');
  var noTabsMessage = document.getElementById('noTabsMessage');
  var errorText = document.getElementById('errorText');

  saveTabButton.addEventListener('click', saveTab);

  chrome.storage.sync.get('importantTabs', function(data) {
    var importantTabs = data.importantTabs || [];

    if (importantTabs.length > 0) {
      tabList.style.display = 'block';
      noTabsMessage.style.display = 'none';

      for (var i = 0; i < importantTabs.length; i++) {
        var tabItem = document.createElement('li');
        tabItem.classList.add('tabItem');

        var tabLink = document.createElement('a');
        tabLink.href = importantTabs[i].url;
        tabLink.target = '_blank';

        var tabIcon = document.createElement('img');
        tabIcon.src = 'https://www.google.com/s2/favicons?domain=' + extractDomain(importantTabs[i].url);
        tabIcon.alt = '';
        tabIcon.classList.add('tabIcon');

        var tabDetails = document.createElement('div');
        tabDetails.classList.add('tabDetails');

        var tabName = document.createElement('div');
        tabName.classList.add('tabName');
        tabName.textContent = extractDomain(importantTabs[i].url);

        var tabContext = document.createElement('div');
        tabContext.classList.add('tabContext');
        tabContext.textContent = importantTabs[i].title;

        tabLink.appendChild(tabIcon);
        tabDetails.appendChild(tabName);
        tabDetails.appendChild(tabContext);
        tabLink.appendChild(tabDetails);

        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('deleteButton');
        deleteButton.addEventListener('click', createDeleteTabHandler(i));

        tabItem.appendChild(tabLink);
        tabItem.appendChild(deleteButton);
        tabList.appendChild(tabItem);
      }
    } else {
      tabList.style.display = 'none';
      noTabsMessage.style.display = 'block';
    }
  });

  function saveTab() {
    var url = tabInput.value.trim();

    if (url === '') {
      showError('Please enter a valid URL');
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var tab = tabs[0];

      getLinkPreview(url, function(linkPreview) {
        var tabData = {
          url: url,
          title: tab.title,
          linkPreview: linkPreview,
        };

        chrome.storage.sync.get('importantTabs', function(data) {
          var importantTabs = data.importantTabs || [];
          importantTabs.push(tabData);

          chrome.storage.sync.set({ importantTabs: importantTabs }, function() {
            console.log('Tab saved successfully!');
            location.reload(); // Refresh the popup to display the updated list
          });
        });
      });
    });
  }

  function createDeleteTabHandler(index) {
    return function() {
      chrome.storage.sync.get('importantTabs', function(data) {
        var importantTabs = data.importantTabs || [];

        if (index >= 0 && index < importantTabs.length) {
          importantTabs.splice(index, 1);

          chrome.storage.sync.set({ importantTabs: importantTabs }, function() {
            console.log('Tab deleted successfully!');
            location.reload(); // Refresh the popup to display the updated list
          });
        }
      });
    };
  }

  function extractDomain(url) {
    var domain;
    // find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf('://') > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    // find & remove port number
    domain = domain.split(':')[0];
    return domain;
  }

  function getLinkPreview(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.linkpreview.net/?key=dfbce43290aec0e3843bc1d51ce7781c&q=' + encodeURIComponent(url), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        if (response.error) {
          console.error(response.error);
          callback(null);
        } else {
          callback(response);
        }
      }
    };
    xhr.send();
  }

  function showError(errorMessage) {
    errorText.textContent = errorMessage;
  }
});

  
  
  
  
  
  
  