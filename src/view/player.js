import blessed from 'blessed';

let screen;
let progressbar;
let playPauseStatus;
let playbacktime;

let createPlayer = (emitter, s) => {
  if (!screen) {
    screen = s;
  }

  progressbar = blessed.progressbar({
    orientation: 'horizontal',
    bottom: 0,
    width: '100%-20',
    left: 10,
    right: 10,
    height: 1,
    filled: 0,
    style: {
      bg: 'cyan',
      bar: {
        bg: 'blue'
      }
    }
  });

  playPauseStatus = blessed.box({
    content: '',
    bottom: 0,
    width: '100%-18',
    left: 8,
    right: 8,
    tags: true,
    height: 1
  });

  playbacktime = blessed.box({
    content: '00:00{|}00:00 ',
    bottom: 0,
    width: '100%-20',
    left: 10,
    tags: true,
    right: 10,
    height: 1,
    transparent: true
  });

  emitter.on('PLAYER_UPDATE', ({paused, current, total, percentage}) => {
    let icon = paused ? '►' : '◼';
    current = current.replace(/^00:/, '');
    total = total.replace(/^00:/, '');
    percentage = percentage === 99 ? 100 : percentage;


    playPauseStatus.setContent(icon);
    playbacktime.setContent(current + '{|}' + total + ' ');
    progressbar.setProgress(percentage);
    screen.render();
  });

  screen.append(playPauseStatus);
  screen.append(progressbar);
  screen.append(playbacktime);
};

export {createPlayer};
