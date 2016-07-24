import blessed from 'blessed';
import {createPlayer} from './view/player';
import events from 'events';
import {init, kill} from './model/player';
import * as listCtrl from './ctrl/list';
import './model/metadata';

let emitter = new events.EventEmitter();
let screen = blessed.screen({smartCSR: true});
let list = listCtrl.init(emitter, screen);

createPlayer(emitter, screen);
screen.append(list);
screen.render();
screen.key(['escape', 'q', 'C-c'], () => {
  kill();
  process.exit(0);
});


init(emitter);
