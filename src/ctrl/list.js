import {play} from '../model/player';
import {createList} from '../view/list';
import _ from 'ramda';
import json from '../../sampledata.json';

let history = [];
let currentType = 'ARTISTS';
let dispatcher;

let init = (emitter, screen) => {
  dispatcher = emitter;
  let view = createList(emitter, screen);
  dispatcher.emit('LIST_ARTISTS', _.keys(json));
  return view;
};

let getActiveType = () => currentType;

let open = name => {
  switch (currentType) {
    case 'ARTISTS':
      history.push(name);
      dispatcher.emit('LIST_ALBUMS', json[name].Albums);
      currentType = 'ALBUMS';
      break;
    case 'ALBUMS':
      history.push(name);
      dispatcher.emit('LIST_TRACKS', json[history[0]].Albums[name].Tracks);
      currentType = 'TRACKS';
      break;
    case 'TRACKS':
      let path = json[history[0]].Albums[history[1]].Path;
      play(path, name);
      break;
  }
};

let back = () => {
  switch (currentType) {
    case 'ALBUMS':
      history = [];
      dispatcher.emit('LIST_ARTISTS', _.keys(json));
      currentType = 'ARTISTS';
      break;
    case 'TRACKS':
      history.pop();
      dispatcher.emit('LIST_ALBUMS', json[history[0]].Albums);
      currentType = 'ALBUMS';
      break;
  }
};

export {init, open, back, getActiveType};
