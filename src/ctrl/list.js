import {play} from '../model/player';
import {createList} from '../view/list';
import _ from 'ramda';
import json from '../../sampledata.json';

let navPath = [];
let playingPath = [];
let currentType = 'ARTISTS';
let dispatcher;

let init = (emitter, screen) => {
  dispatcher = emitter;
  let view = createList(emitter, screen);
  dispatcher.emit('LIST_ARTISTS', _.keys(json));
  dispatcher.on('TRACK_UPDATE', track => {
    if (_.is(Number, _.last(playingPath))) {
      playingPath[playingPath.length - 1] = track;
    } else {
      playingPath.push(track);
    }
    if (currentType === 'TRACKS') {
      dispatcher.emit('LIST_TRACKS', json[navPath[0]].Albums[navPath[1]].Tracks);
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
};

let open = name => {
  switch (currentType) {
    case 'ARTISTS':
      navPath.push(name);
      currentType = 'ALBUMS';
      dispatcher.emit('LIST_ALBUMS', json[name].Albums);
      break;
    case 'ALBUMS':
      navPath.push(name);
      currentType = 'TRACKS';
      dispatcher.emit('LIST_TRACKS', json[navPath[0]].Albums[name].Tracks);
      break;
    case 'TRACKS':
      let path = json[navPath[0]].Albums[navPath[1]].Path;
      playingPath = navPath.slice();
      // console.log('c',playingPath)
      play(path, name);
      break;
  }
};

let back = () => {
  switch (currentType) {
    case 'ALBUMS':
      navPath = [];
      currentType = 'ARTISTS';
      dispatcher.emit('LIST_ARTISTS', _.keys(json));
      break;
    case 'TRACKS':
      navPath.pop();
      currentType = 'ALBUMS';
      dispatcher.emit('LIST_ALBUMS', json[navPath[0]].Albums);
      break;
  }
};

export {init, open, back, getActiveType, getPlaying};
