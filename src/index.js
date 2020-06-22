import M$plugin$FreeDraw from './/facade/js/freedraw';
import M$control$FreeDrawControl from './/facade/js/freedrawcontrol';
import M$impl$control$FreeDrawControl from './/impl/ol/js/freedrawcontrol';

if (!window.M.plugin) window.M.plugin = {};
if (!window.M.control) window.M.control = {};
if (!window.M.impl) window.M.impl = {};
if (!window.M.impl.control) window.M.impl.control = {};
window.M.plugin.FreeDraw = M$plugin$FreeDraw;
window.M.control.FreeDrawControl = M$control$FreeDrawControl;
window.M.impl.control.FreeDrawControl = M$impl$control$FreeDrawControl;
