import { Window } from 'happy-dom';

const happyWindow = new Window();

global.window = happyWindow;
global.document = happyWindow.document;
global.HTMLElement = happyWindow.HTMLElement;
global.HTMLInputElement = happyWindow.HTMLInputElement;
global.HTMLTextAreaElement = happyWindow.HTMLTextAreaElement;
global.HTMLFormElement = happyWindow.HTMLFormElement;
global.Element = happyWindow.Element;
global.Node = happyWindow.Node;
