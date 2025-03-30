
import { anyDict } from '../../types/index';
import { Application } from '../../types/automation';
import { app, BrowserWindow, screen } from 'electron';
import { createWindow, ensureOnCurrentScreen, releaseFocus } from './index';
//import MacosAutomator from '../../automations/macos';
//import WindowsAutomator from '../../automations/windows';
import autolib from 'autolib';
import { wait } from '../utils';

export let commandPicker: BrowserWindow = null;

const width = 300;
const height = 320;

let commanderStartTime: number|undefined
let sourceApp: Application|undefined;

export const prepareCommandPicker = (queryParams?: anyDict): void => {

  // open a new one
  commandPicker = createWindow({
    hash: '/commands',
    title: 'WitsyCommandPicker',
    x: 0, y: 0,
    width: width,
    height: height,
    frame: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    resizable: process.env.DEBUG ? true : false,
    hiddenInMissionControl: true,
    queryParams: queryParams,
    keepHidden: true,
    hasShadow: false,
  });

  // focus tricks
  commandPicker.on('show', () => {

    // focus
    app.focus({ steal: true });
    commandPicker.moveTop();
    commandPicker.focusOnWebView();

    // try to activate (make foremost)
    activateCommandPicker();
    
    // log
    if (commanderStartTime) {
      console.log(`Command picker total time: ${Date.now() - commanderStartTime}ms`);
    }

  })

  // prevent close with keyboard shortcut
  commandPicker.on('close', (event) => {
    closeCommandPicker(sourceApp);
    event.preventDefault();
  });

}

export const openCommandPicker = (params: anyDict): void => {

  // save
  sourceApp = params.sourceApp;
  commanderStartTime = params.startTime;

  // if we don't have a window, create one
  if (!commandPicker || commandPicker.isDestroyed()) {
    prepareCommandPicker(params);
  } else {
    commandPicker.webContents.send('show', params);
  }

  // check prompt is on the right screen
  ensureOnCurrentScreen(commandPicker);

  // and at right location
  const { x, y } = screen.getCursorScreenPoint();
  commandPicker.setBounds({
    x: x - width/2,
    y: y - (params.sourceApp ? 64 : 24),
    width: width,
    height: height,
  });

  // done
  commandPicker.show();
  
}

export const closeCommandPicker = async (sourceApp?: Application): Promise<void> => {

  // check
  if (commandPicker === null || commandPicker.isDestroyed()) {
    return;
  }

  try {

    // remove blur handler
    //console.log('Removing blur handler from command picker');
    commandPicker.removeAllListeners('blur');

    // now hide (and restore opacity)
    commandPicker.hide();
    
    // now release focus
    await releaseFocus({ sourceApp });

  } catch (error) {
    console.error('Error while hiding command picker', error);
    commandPicker = null;
  }  

};


 
const activateCommandPicker = async () => {
  
  const isThere = () =>
    commandPicker &&
    !commandPicker.isDestroyed() &&
    commandPicker.isVisible() &&
    commandPicker.getOpacity() > 0;

  // wait for command picker to be visible
  const start = Date.now();
  const totalWait = 1000;
  while (!isThere() && Date.now() - start < totalWait) {
    await wait(50);
  } 

  if (!isThere()) {
    console.log('Command picker is not visible after 1 second, not activating');
    return;
  }

  try {

    // clear blur handlers
    commandPicker.removeAllListeners('blur');

    // // macos
    // if (process.platform === 'darwin') {
    //   const automator = new MacosAutomator();
    //   await automator.focusApp({
    //     id: process.env.DEBUG ? 'com.github.Electron' : 'com.nabocorp.witsy',
    //     name: 'Witsy',
    //     path: '',
    //     window: null//commandPicker.getTitle(),
    //   })
    // }

    // windows: click at the top-center of the command picker
    // this is a workaround to make the command picker
    // become the active window
    if (process.platform === 'win32') {
      try {
        const [winX, winY] = commandPicker.getPosition()
        const [winW] = commandPicker.getSize()
        const x = winX + winW / 2;
        const y = winY + 2;
        const pt = screen.dipToScreenPoint({ x, y });
        await autolib.mouseClick(pt.x, pt.y);
      } catch (err) {
        console.warn('mouseClick failed', err);
      }      
    }

  } finally {

    // now add blur handler
    if (isThere()) {
      //console.log('Adding blur handler to command picker');
      commandPicker.removeAllListeners('blur');
      commandPicker.on('blur', () => {
        closeCommandPicker(sourceApp);
      });
    } else {
      //console.log('Command picker is not visible, not adding blur handler');
    }
    
  }

}
