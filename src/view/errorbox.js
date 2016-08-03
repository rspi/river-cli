import blessed from 'blessed';

let displayError = (message, screen) => {
  let options = {
    left: 'center',
    top: 'center',
    height: 3,
    border: {
      type: 'line'
    },
    style: {
      fg: 'red'
    }
  };
  let msgBox = blessed.message(options);
  msgBox.display(' ⚠  ' + message, 0, () => {
    process.exit();
  });
  screen.append(msgBox);
  screen.render();
};

export {displayError};
