import {play} from '../model/player';
import {createList} from '../view/list';
import _ from 'ramda';
import json from '../../sampledata.json';

let history = [];
let currentType = 'ARTISTS';

let init = (emitter, screen) => {
  let view = createList(emitter, screen);
  emitter.emit('LIST_ARTISTS', _.keys(json));
  listen(emitter);
  return view;
};


let listen = emitter => {
  emitter.on('OPEN', data => {

    switch (currentType) {
      case 'ARTISTS':
        history.push(data);
        emitter.emit('LIST_ALBUMS', json[data].Albums);
        currentType = 'ALBUMS';
        break;
      case 'ALBUMS':
        history.push(data);
        emitter.emit('LIST_TRACKS', json[history[0]].Albums[data].Tracks);
        currentType = 'TRACKS';
        break;
      case 'TRACKS':
        let path = json[history[0]].Albums[history[1]].Path;
        play(path, data);
        break;
    }
  });
  emitter.on('BACK', () => {
    switch (currentType) {
      case 'ALBUMS':
        history = [];
        emitter.emit('LIST_ARTISTS', _.keys(json));
        currentType = 'ARTISTS';
        break;
      case 'TRACKS':
        history.pop();
        emitter.emit('LIST_ALBUMS', json[history[0]].Albums);
        currentType = 'ALBUMS';
        break;
    }
  });
};

export {init};
