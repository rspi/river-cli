import blessed from 'blessed';
import _ from 'ramda';
import * as ctrl from '../ctrl/list';

let list;
let namemap = [];
let screen;
let selectionHistory = [];
let lastIndex = 0;

let options = {
  top: 0,
  left: 'center',
  width: '100%',
  items: [],
  height: '100%-1',
  tags: true,
  keys: true,
  mouse: true,
  vi: true,
  transparent: false,
  scrollbar: {
    ch: ' '
  },
  border: {
    type: 'line'
  },
  style: {
    selected: {
      bg: 'cyan'
    },
    scrollbar: {
      bg: 'blue'
    }
  }
};

let createList = (emitter, s) => {
  if (!list) {
    list = blessed.list(options);
    list.focus();
    screen = s;
  }
  applyListeners(emitter);
  handleUserInput();
  return list;
};

let applyListeners = (emitter) => {
  emitter.on('LIST_ARTISTS', setArtistList);
  emitter.on('LIST_ALBUMS', setAlbumList);
  emitter.on('LIST_TRACKS', setTrackList);
};

let handleUserInput = () => {
  list.on('select', (_, index) => {
    if (ctrl.getActiveType() !== 'TRACKS') {
      selectionHistory.push(index);
      lastIndex = 0;
    }
    ctrl.open(namemap[index]);
  });
  list.on('keypress', (_, key) => {
    if (key.name === 'backspace' || key.name === 'h') {
      lastIndex = selectionHistory.pop() || 0;
      ctrl.back();
    }
  });
};

let setArtistList = (artists) => {
  namemap = artists;
  let curretlyPlaying = ctrl.getPlaying();
  let toString = artistname => {
    let symbol = curretlyPlaying === artistname ? '❯' : ' ';
    return symbol + artistname;
  };
  list.setItems(artists.map(toString));
  list.select(lastIndex);
  screen.render();
};

let setAlbumList = (albums) => {
  let curretlyPlaying = ctrl.getPlaying();
  let sortByYear = _.sortBy(_.prop('Year'));

  let toString = album => {
    let symbol = curretlyPlaying === album.Name ? '❯' : ' ';
    return symbol + '[' + album.Year + '] ' + album.Name;
  };

  albums = sortByYear(_.values(albums));
  namemap = albums.map(album => album.Name);
  list.setItems(albums.map(toString));
  list.select(lastIndex);
  screen.render();
};

let setTrackList = (tracks) => {
  let curretlyPlaying = ctrl.getPlaying();
  let sortByNumber = _.sortBy(_.prop('Number'));
  let toString = track => {
    let tracknumber = track.Number < 10 ? '0' + track.Number : track.Number;
    let symbol = curretlyPlaying === track.Number ? '❯' : ' ';
    return symbol + tracknumber + ' ' + track.Name + '{|}' + track.Length;
  };
  tracks = sortByNumber(_.values(tracks));
  namemap = tracks.map(track => track.Number);
  list.setItems(tracks.map(toString));
  list.select(lastIndex);
  screen.render();
};

export {createList};
