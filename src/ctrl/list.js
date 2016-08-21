import {play} from '../model/player';
import {createList} from '../view/list';
import _ from 'ramda';
import {metaDataPromise} from '../model/metadata';
import {sorted as sortedPath, unsorted as unsortedPath} from '../model/config';
import {host, username, password} from '../model/config';

let navPath = [];
let playingPath = [];
let currentType = 'SELECT_LIST';
let dispatcher;
let json;

let init = (emitter, screen) => {
  dispatcher = emitter;
  let view = createList(emitter, screen);

  metaDataPromise.then(resp => {
    json = resp;
    dispatcher.emit('SELECT_LIST');

    dispatcher.on('TRACK_UPDATE', track => {
      if (_.is(Number, _.last(playingPath))) {
        playingPath[playingPath.length - 1] = track;
      } else {
        playingPath.push(track);
      }
      if (currentType === 'TRACKS') {
        dispatcher.emit('LIST_TRACKS', json.Sorted[navPath[0]].Albums[navPath[1]].Tracks);
      }
    });
  }).catch(err => {
    if (err.code === 401) {
      dispatcher.emit('UNAUTHORIZED');
    }
    if (err.errno === 'ECONNREFUSED') {
      dispatcher.emit('METADATA_FETCH_ERROR');
    }
  });

  return view;
};

let getActiveType = () => currentType;


let getPlaying = () => {
  switch (currentType) {
    case 'ARTISTS':
      return playingPath[0];
    case 'ALBUMS':
      return playingPath[1];
    case 'TRACKS':
      if (_.equals(playingPath.slice(0, -1), navPath)) {
        return playingPath[2];
      }
  }
  return -1;
};

let open = name => {
  switch (currentType) {
    case 'ARTISTS':
      if (json.Sorted && json.Sorted[name]) {
        navPath.push(name);
        currentType = 'ALBUMS';
        dispatcher.emit('LIST_ALBUMS', json.Sorted[name].Albums);
      }
      break;
    case 'ALBUMS':
      navPath.push(name);
      currentType = 'TRACKS';
      dispatcher.emit('LIST_TRACKS', json.Sorted[navPath[0]].Albums[name].Tracks);
      break;
    case 'TRACKS':
      playingPath = navPath.slice();
      let tracks = json.Sorted[navPath[0]].Albums[navPath[1]].Tracks;
      tracks.forEach(track => {
        track.Path = sortedPath + '/' + track.Path;
      });
      let playlist = buildPlaylist(tracks);
      play(playlist, name);
      break;
  }
};

let URLilize = path => {
  let basicAuth = username + ':' + password + '@';
  let encodedPath = encodeURIComponent(path)
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  if (host.indexOf('http') !== -1) {
    return host.replace(/:\/\//g, '://' + basicAuth) + '/' + encodedPath;
  }
};

let buildPlaylist = tracks => tracks
  .map(track => track.Path)
  .map(URLilize);

let openFileNode = (index) => {
  playingPath = [];

  let openNode = json.Unsorted;
  for (let i = 0;i < navPath.length;i++) {
    let name = navPath[i];
    openNode = openNode.Folders[name];
  }
  let playlist = buildPlaylist(openNode.Files.map(file => ({
    Path: unsortedPath + '/' + navPath.concat([file.Name]).join('/')
  })));
  let position = index + 1;
  play(playlist, position);
};

let openFolderNode = (name) => {
  navPath.push(name);
  listNodeUpdate();
};

let listNodeUpdate = () => {
  let openNode = json.Unsorted;
  for (let i = 0;i < navPath.length;i++) {
    let name = navPath[i];
    openNode = openNode.Folders[name];
  }
  dispatcher.emit('LIST_NODES', openNode);
};

let selectListType = type => {
  switch (type) {
    case 'SORTED':
      currentType = 'ARTISTS';
      dispatcher.emit('LIST_ARTISTS', _.keys(json.Sorted));
      break;
    case 'UNSORTED':
      currentType = 'NODE';
      dispatcher.emit('LIST_NODES', json.Unsorted);
      break;
  }
};

let back = () => {
  switch (currentType) {
    case 'NODE':
      if (navPath.length === 0) {
        currentType = 'SELECT_LIST';
        dispatcher.emit('SELECT_LIST');
      } else {
        navPath.pop();
        listNodeUpdate();
      }
      break;
    case 'ARTISTS':
      currentType = 'SELECT_LIST';
      dispatcher.emit('SELECT_LIST');
      break;
    case 'ALBUMS':
      navPath = [];
      currentType = 'ARTISTS';
      dispatcher.emit('LIST_ARTISTS', _.keys(json.Sorted));
      break;
    case 'TRACKS':
      navPath.pop();
      currentType = 'ALBUMS';
      dispatcher.emit('LIST_ALBUMS', json.Sorted[navPath[0]].Albums);
      break;
  }
};

export {
  init,
  open,
  back,
  getActiveType,
  getPlaying,
  selectListType,
  openFolderNode,
  openFileNode
};
