var urls, urlSong;
urls = [];

chrome.webRequest.onBeforeRequest.addListener(
     function (details) {
          var url, time;

          url = details.url;
          time = details.timeStamp;

          urlSong = url;

          if (jQuery.inArray(url, urls) === -1) {
               urls.push(url);
          }

     },
     {
          urls: ["*://tracks00.cdn.superplayer.fm/*"]
     },
     ["requestBody"]
);

chrome.runtime.onMessage.addListener(
     function (request, sender, sendResponse) {
          if (request.askFor === "urlSong") {

               sendResponse(urls[request.id]);

          } else if (request.askFor === "reset") {

               reset();

          }
     }
);

function reset() {
     urls = [];
     urlSong = "";

     return true;
}
