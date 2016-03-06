import blessed from 'blessed';
import {createList} from './view/list';
import {createPlayer} from './view/player';
import json from '../sampledata.json';
import events from 'events';
import _ from 'ramda';
import {play, init, kill} from './model/player';


let emitter = new events.EventEmitter();

let screen = blessed.screen({smartCSR: true});
let list = createList(emitter, screen);
createPlayer(emitter, screen);
screen.append(list);
screen.render();
screen.key(['escape', 'q', 'C-c'], () => {
  kill();
  process.exit(0);
});


init(emitter);

let history = [];
let currentType = 'ARTISTS';
emitter.emit('LIST_ARTISTS', _.keys(json));
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


