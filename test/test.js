import FreeDraw from 'facade/freedraw';

const map = M.map({
  container: 'mapjs',
});

const mp = new FreeDraw({
  position: 'TL',
});

// Prueba layer popup
// const layer = new M.layer.KML({ name: 'capawfs', url: 'http://mapea4-sigc.juntadeandalucia.es/files/kml/arbda_sing_se.kml' });

// map.addLayers(layer);

map.addPlugin(mp);

window.map = map;
