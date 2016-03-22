var CurrentSong = {
     artist: null,
     name: null,
     album: null,
     cover: null,
     playlist: null,
     duration: null,
     urlSong: null
}

askForCurrentSong();

function askForCurrentSong() {
     chrome.tabs.query({}, function(tabs) {
          var tabID = searchTab("superplayer.fm", tabs).id;

          chrome.tabs.sendMessage(tabID, {askFor: "currentSong"}, function(response) {
               if (response !== undefined) {
                    CurrentSong = response;
                    insertSong(CurrentSong);
               }
          });
     });
}

function searchTab(url, myArray){
     for (var i=0; i < myArray.length; i++) {
          if (myArray[i].url.indexOf(url) > -1) {
               return myArray[i];
          }
     }
}

function insertSong(song) {
     var name = CurrentSong.name;
     var artist = CurrentSong.artist;
     var cover = CurrentSong.cover;
     var urlSong = CurrentSong.urlSong;

     var html = "<div class=\"music\"><div class=\"cover\"><img src=\"" + cover + "\" alt=\"cover\" /></div><div class=\"text\"><span class=\"name\">" + name + "</span> <span class=\"conj\">por</span> <span class=\"artist\">" + artist + "</span><br /><span class=\"album\">#album#</span><br /><span class=\"playlist\">#playlist#</span><a class=\"download\" href='" + urlSong + "' download=\"" + name + " - " + artist + ".mp3\" ></a><div style=\"clear:both\"></div></div></div>";

     $("body").append(html);
}
