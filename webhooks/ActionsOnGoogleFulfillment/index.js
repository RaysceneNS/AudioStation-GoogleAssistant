const {
  conversation,
  Media,
} = require('@assistant/conversation');
const functions = require('firebase-functions');
const https = require('https');

const app = conversation({debug: true});
const host = process.env.API_HOST;

const createMediaStream = (track, token) => {
  return new Media({
    mediaObjects: [{
      name: `${track.title}`,
      description: `${track.album} by ${track.artist}`,
      url: `https://${host}:5001/webapi/entry.cgi/SYNO.AudioStation.VoiceAssistant.Stream?api=SYNO.AudioStation.VoiceAssistant.Stream&method=stream&version=1&track_id=${track.id}&_oat=%22${token}%22`,
    }],
    mediaType: 'AUDIO',
    optionalMediaControls: ['PAUSED', 'STOPPED'],
  });
};

const browseMedia = (requestBody, token) => {
  return new Promise(function(resolve, reject) {
    let urlparams = {
      host: host,
      port: 5001,
      path: '/webapi/entry.cgi/SYNO.AudioStation.VoiceAssistant.Browse',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = https.request(urlparams, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        } else {
          reject('Status:' + res.statusCode);
        }
      });
    });
    req.write(requestBody);
    req.end();
  });
};

// play next track
app.handle('play_next', (conv) => {
  let tracks = conv.session.params.tracks;
  if (tracks && tracks.length > 0) {
    conv.add(createMediaStream(tracks.shift(), conv.user.params.bearerToken));
    conv.session.params.tracks = tracks;
  }
});

// Song
app.handle('play_song', (conv) => {
  const song = conv.intent.params.song.original;
  return browseMedia(`title=%22${encodeURI(song)}%22&api=SYNO.AudioStation.VoiceAssistant.Browse&method=search&version=1&offset=0&limit=10`, conv.user.params.bearerToken).then((jsonResult) => {
    if (jsonResult.success) {
      conv.session.params.tracks = jsonResult.data.track;
      conv.scene.next.name = 'Playlist';
    } else {
      conv.add('I can\'t find that song.');
    }
  }).catch(function(err) {
    console.log(err);
    conv.add('It failed!');
  });
});

// Album
app.handle('play_album', (conv) => {
  const album = conv.intent.params.album.original;
  return browseMedia(`album=%22${encodeURI(album)}%22&api=SYNO.AudioStation.VoiceAssistant.Browse&method=search&version=1&offset=0&limit=50`, conv.user.params.bearerToken).then((jsonResult) => {
    if (jsonResult.success) {
      conv.session.params.tracks = jsonResult.data.track;
      conv.scene.next.name = 'Playlist';
    } else {
      conv.add('I can\'t find that album.');
    }
  }).catch(function(err) {
    console.log(err);
    conv.add('It failed!');
  });
});

// Artist
app.handle('play_artist', (conv) => {
  const artist = conv.intent.params.artist.original;
  return browseMedia(`artist=%22${encodeURI(artist)}%22&api=SYNO.AudioStation.VoiceAssistant.Browse&method=search&version=1&offset=0&limit=50`, conv.user.params.bearerToken).then((jsonResult) => {
    if (jsonResult.success) {
      conv.session.params.tracks = jsonResult.data.track;
      conv.scene.next.name = 'Playlist';
    } else {
      conv.add('I can\'t find that artist.');
    }
  }).catch(function(err) {
    console.log(err);
    conv.add('It failed!');
  });
});

// Media Status
app.handle('media_status', (conv) => {
  const mediaStatus = conv.intent.params.MEDIA_STATUS.resolved;
  switch (mediaStatus) {
    case 'FINISHED':
      // console.log('Finished playing.');
      break;
    case 'FAILED':
      conv.add('Media has failed.');
      conv.session.params.tracks = [];
      break;
    case 'PAUSED' || 'STOPPED':
      conv.add(new Media({
        mediaType: 'MEDIA_STATUS_ACK',
      }));
      break;
    default:
      conv.add('Unknown media status received.');
  }
});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
