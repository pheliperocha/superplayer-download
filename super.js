var checkInterval;

var Player = {
     hasPlayer: false,
     this: null,
     play: null,
     skip: null,
     love: null,
     isPlaying: false,
     timer: null,
     getTimer: function () {
          return this.timer.text();
     }
};

var CurrentSong = {
     id: null,
     artist: null,
     name: null,
     album: null,
     cover: null,
     playlist: null,
     duration: null,
     urlSong: null
};

var startId = 0;
var histSongName = [];
var histSongArtist = [];

startWatch();

function startWatch() {
     reset();
     checkInterval = setInterval(function() {
          if (checkIfHasPlayer()) {
               getCurrentSong(function() {
                    insertDownloadButton();
               });
               stopWatch();
          }
     }, 1000);
}

function stopWatch() {
     clearInterval(checkInterval);
}

function reset(_callback) {
     startId = 0;
     histSongName = [];
     histSongArtist = [];

     chrome.runtime.sendMessage({askFor: "reset"}, function(response) {
          _callback();
     });
}

function checkIfHasPlayer() {
     var objPlayer = $("section[data-component='player-controls']");
     Player.hasPlayer = (objPlayer.length === 1) ? true : false;

     if (Player.hasPlayer) {
          Player.this = objPlayer;
          Player.play = objPlayer.find("button[data-action='pause']");
          Player.skip = objPlayer.find("button[data-action='skip']");
          Player.love = objPlayer.find("button[data-action='love']");
          Player.timer = objPlayer.find("span[data-value='currentTime']");

          setClickedBtns();
     }

     return Player.hasPlayer;
}

function getCurrentSong(_callback) {
     if (Player.hasPlayer) {
          var cover = Player.this.find("span[data-value='cover']").css('background-image');
          cover = cover.replace('url("', '').replace('")', '');

          CurrentSong.name = $.trim(Player.this.find("span[data-value='name']").text());
          CurrentSong.artist = $.trim(Player.this.find("strong[data-value='artist']").text());
          CurrentSong.cover = cover;

          if (jQuery.inArray(CurrentSong.name, histSongName) === -1 && jQuery.inArray(CurrentSong.artist, histSongArtist) === -1) {
               CurrentSong.id = startId;
               histSongName.push(CurrentSong.name);
               histSongArtist.push(CurrentSong.artist);
          }

          askForMp3URL(CurrentSong.id, _callback);

          startId = histSongName.length;

          return CurrentSong;
     }
}

function askForMp3URL(songId, _callback) {
     chrome.runtime.sendMessage({askFor: "urlSong", id: songId}, function(response) {
          CurrentSong.urlSong = response;
          _callback();
     });
}

function waitForLoading(_callback) {
     var isLoadingPage = $('section[data-component="loading"]').is(":visible");

     if (!isLoadingPage) {
          _callback();
     } else {
          setTimeout(waitForLoading.bind(null, _callback), 500);
     }
}

function insertDownloadButton() {
     if (Player.hasPlayer) {
          var downloadBtn = "<a href=\"" + CurrentSong.urlSong + "\" id=\"btnDownload\" class=\"clear\" title=\"Baixar Música\" data-action=\"download\" download=\"" + CurrentSong.artist + " - " + CurrentSong.name + ".mp3\"><i data-component=\"icon\"></i></a>";
          Player.love.before(downloadBtn);
     }
}

function removeDownloadButton() {
     var downloadBtn = $("#btnDownload");

     if (downloadBtn.length) {
          downloadBtn.remove();

          return true;
     }

     return false;
}

function updateDownloadButton() {
     removeDownloadButton();

     setTimeout(function() {
          waitForLoading(function() {
               getCurrentSong(function() {
                    insertDownloadButton();
               });
          });
     }, 500);
}

function setClickedBtns() {
     Player.skip.on("click", function() {
          updateDownloadButton();
     });

     $(document).on("click", "button[data-action='play'], button[data-action='mix']", function() {
          reset(function() {
               updateDownloadButton();
          });
     });
}

/*function checkIfIsPlaying() {
     var objPlayer = $("section[data-component='player-controls']");
     Player.hasPlayer = (objPlayer.length === 1) ? true : false;

     if (Player.hasPlayer) {
          Player.this = objPlayer;
          Player.play = objPlayer.find("button[data-action='pause']");
          Player.love = objPlayer.find("button[data-action='love']");
          Player.timer = objPlayer.find("span[data-value='currentTime']");

          if (Player.play.hasClass("active")) {
               Player.isPlaying = false;
          } else {
               Player.isPlaying = true;
               getCurrentSong();
               stopWatch();
               return true;
          }
     }
}*/

chrome.runtime.onMessage.addListener(
     function (request, sender, sendResponse) {

          if (request.askFor === "currentSong") {
               if (Player.hasPlayer) {
                    sendResponse(getCurrentSong());
               }
          }

     }
);
