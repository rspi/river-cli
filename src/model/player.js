import {spawn} from 'child_process';

let emitter;
let mpv;

let init = (e) => {
  emitter = e;
};

let kill = () => {
  if (mpv) {
    mpv.kill();
  }
};

let play = (path, position) => {
  kill();
  let host = 'http://localhost:8000/';
  if (!position) {
    mpv = spawn('mpv', [host + encodeURI(path), '--no-audio-display']);
  } else {
    mpv = spawn('mpv', ['--playlist=' + host + path + 'playlist.m3u', '--playlist-pos=' + (position - 1), '--no-audio-display']);
  }

  // mpv.on('close', () => process.exit(0));
  mpv.on('exit', () => {
  });

  mpv.stderr.on('data', data => {
    let string = data.toString();
    let str = string.match(new RegExp(/(\d\d\:\d\d:\d\d)|\(([^\)]+)%\)/g));

    let paused = string.indexOf('Paused') !== -1;
    let current = str[0];
    let total = str[1];
    let percentage = str[2].replace(/\D/g, '');

    emitter.emit('PLAYER_UPDATE', {paused, current, total, percentage});
  });

  mpv.stdout.on('data', data => {
    let regexp = /Track:\s(\d+)/;
    let tr = data.toString().match(regexp);
    if (tr !== null) {
      emitter.emit('TRACK_UPDATE', +tr[1]);
    }
  });
};

export {play, init, kill};
