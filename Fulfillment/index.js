const {
    conversation,
    Card,
    Collection,
    Simple,
    List,
    Media,
    Image,
  } = require('@assistant/conversation');
  const functions = require('firebase-functions');
  const https = require('https');
  const app = conversation({debug: true});
  
  const media_stream = (track, token) => {
    return new Media({
      mediaObjects: [{
        name: `${track.title}`,
        description: `${track.album} by ${track.artist}`,
        url: `https://server:5001/webapi/entry.cgi/SYNO.AudioStation.VoiceAssistant.Stream?api=SYNO.AudioStation.VoiceAssistant.Stream&method=stream&version=1&track_id=${track.id}&_oat=%22${token}%22`,
      }],
      mediaType: 'AUDIO',
      optionalMediaControls: ['PAUSED', 'STOPPED']
    });
  };
  
  const browse_media = (request_body, token) => {
    return new Promise(function(resolve, reject) {   
      var urlparams = {
        host: 'server',
        port: 5001,
        path: '/webapi/entry.cgi/SYNO.AudioStation.VoiceAssistant.Browse',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        }
      };
  
      const req = https.request(urlparams, (res) => {    
        let body = '';
        res.on("data", chunk => { 
          body += chunk; 
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
              try {
                resolve(JSON.parse(body));
              } 
              catch(e) {
                reject(e);
              }
          } 
          else {
            reject('Status:' + res.statusCode);
          }
        });
      });
      req.write(request_body);
      req.end(); 
    });
  };
  
  // Song
  app.handle('play_song', (conv) => {
    const song = conv.intent.params.song.original;
    return browse_media(`title=%22${encodeURI(song)}%22&api=SYNO.AudioStation.VoiceAssistant.Browse&method=search&version=1&offset=0&limit=10`, conv.user.params.bearerToken).then(json_result => {
      if(json_result.success) {
        conv.add(media_stream(json_result.data.track.shift(), conv.user.params.bearerToken));
      }
      else {
            conv.add("I couldn't play that song.");
      }
    }).catch(function(err) {
      console.log(err);
        conv.add("It failed! ");
      });
  });
  
  // Album
  app.handle('play_album', (conv) => {
    const album = conv.intent.params.album.original;
      return browse_media(`album=%22${encodeURI(album)}%22&api=SYNO.AudioStation.VoiceAssistant.Browse&method=search&version=1&offset=0&limit=10`, conv.user.params.bearerToken).then(json_result => {
          if(json_result.success) {
        conv.add(media_stream(json_result.data.track.shift(), conv.user.params.bearerToken));
      }
      else {
            conv.add("I couldn't play that album.");
      }
    }).catch(function(err) {
      console.log(err);
        conv.add("It failed!");
      });
  });
  
  // Artist
  app.handle('play_artist', (conv) => {
    const artist = conv.intent.params.artist.original;
    return browse_media(`artist=%22${encodeURI(artist)}%22&api=SYNO.AudioStation.VoiceAssistant.Browse&method=search&version=1&offset=0&limit=10`, conv.user.params.bearerToken).then(json_result => {
      if(json_result.success) {
        conv.add(media_stream(json_result.data.track.shift(), conv.user.params.bearerToken));
      }
      else {
        conv.add("I couldn't play that artist.");
      }
    }).catch(function(err) {
      console.log(err);
        conv.add("It failed!");
      });
  });
  
  // Media Status
  app.handle('media_status', (conv) => {
    const mediaStatus = conv.intent.params.MEDIA_STATUS.resolved;
    switch(mediaStatus) {
      case 'FINISHED':
        conv.add('Finished playing.');
        break;
      case 'FAILED':
        conv.add('Media has failed.');
        break;
      case 'PAUSED' || 'STOPPED':
        conv.add(new Media({
          mediaType: 'MEDIA_STATUS_ACK'
        }));
        break;
      default:
        conv.add('Unknown media status received.');
    }
  });
  
  exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
  