import blessed from 'blessed';
import _ from 'ramda';

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
  applyDispatchers(emitter);
  return list;
};

let applyListeners = (emitter) => {
  emitter.on('LIST_ARTISTS', setArtistList);
  emitter.on('LIST_ALBUMS', setAlbumList);
  emitter.on('LIST_TRACKS', setTrackList);
};

let applyDispatchers = (emitter) => {
  list.on('select', (_, index) => {
    // check if the item is a playable.
    selectionHistory.push(index);
    lastIndex = 0;
    emitter.emit('OPEN', namemap[index]);
  });
  list.on('keypress', (_, key) => {
    if (key.name === 'backspace' || key.name === 'h') {
      lastIndex = selectionHistory.pop() || 0;
      emitter.emit('BACK');
    }
  });
};

let setArtistList = (artists) => {
  namemap = artists;
  let toString = artistname => ' ' + artistname;
  list.setItems(artists.map(toString));
  list.select(lastIndex);
  screen.render();
};

let setTrackList = (tracks) => {
  let sortByNumber = _.sortBy(_.prop('Number'));
  let toString = track => {
    let tracknumber = track.Number < 10 ? '0' + track.Number : track.Number;
    return ' ' + tracknumber + ' ' + track.Name + '{|}' + track.Length;
  };
  tracks = sortByNumber(_.values(tracks));
  namemap = tracks.map(track => track.Number);
  list.setItems(tracks.map(toString));
  list.select(lastIndex);
  screen.render();
};

let setAlbumList = (albums) => {
  let sortByYear = _.sortBy(_.prop('Year'));
  let toString = album => ' [' + album.Year + '] ' + album.Name;

  albums = sortByYear(_.values(albums));
  namemap = albums.map(album => album.Name);
  list.setItems(albums.map(toString));
  list.select(lastIndex);
  screen.render();
};

export {createList};
