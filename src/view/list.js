import blessed from 'blessed';
import _ from 'ramda';
import * as ctrl from '../ctrl/list';

let list;
let namemap = [];
let screen;
let selectionHistory = [];
let lastIndex = 0;

let currentlyVisibleFolders = [];
let currentlyVisibleFiles = [];

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
  emitter.on('SELECT_LIST', selectList);
  emitter.on('LIST_NODES', setNodeList);
};

let selectList = () => {
  list.setItems([' Music sorted by tags', ' Music by folder structure']);
  list.select(lastIndex);
  screen.render();
};

let handleUserInput = () => {
  list.on('select', (_, index) => {
    switch (ctrl.getActiveType()) {
      case 'NODE':
        const noFiles = currentlyVisibleFiles.length === 0;
        const noFolders = currentlyVisibleFolders.length === 0;

        if (noFiles && noFolders) {
          break;
        }

        lastIndex = 0;

        if (noFolders || index >= currentlyVisibleFolders.length) {
          ctrl.openFileNode(index);
        } else {
          selectionHistory.push(index);
          ctrl.openFolderNode(currentlyVisibleFolders[index]);
        }
        break;
      case 'SELECT_LIST':
        let listType = index === 0 ? 'SORTED' : 'UNSORTED';
        selectionHistory.push(index);
        ctrl.selectListType(listType);
        break;
      case 'ARTISTS':
      case 'ALBUMS':
        selectionHistory.push(index);
        lastIndex = 0;
      case 'TRACKS':
        ctrl.open(namemap[index]);
        break;
    }
  });

  list.on('keypress', (_, key) => {
    if (key.name === 'backspace' || key.name === 'h') {
      lastIndex = selectionHistory.pop() || 0;
      ctrl.back();
    }
  });
};

let setNodeList = node => {
  currentlyVisibleFolders = _.keys(node.Folders);
  currentlyVisibleFiles = node.Files.map(file => file.Name);

  let toRender = currentlyVisibleFolders
    .concat(currentlyVisibleFiles)
    .map(name => ' ' + name);

  list.setItems(toRender);
  list.select(lastIndex);
  screen.render();
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
