// ============================================
// Planet palette — matches the UE5 version (sRGB hex).
// These are scene data, not UI colours: the UI panel uses only the CSS
// variables in global.css. Keep all 3D hex values here so components stay
// free of hard-coded colours.
// ============================================

export const BIOME = {
  // Water
  lake: '#4AA8E8',
  deepOcean: '#143F8C',
  ocean: '#1E5FBF',
  shelf: '#3A8FE0',
  shallows: '#63B8F0',
  seaIce: '#DDEBF7',
  // Land
  savanna: '#A8B552',
  grassland: '#62AD45',
  tundra: '#93A07C',
  hills: '#86B85A',
  forest: '#2F7D3A',
  deepForest: '#1F6130',
  taiga: '#2A5F4A',
  desert: '#E0BE78',
  desertDark: '#CFA75C',
  beach: '#E8D9A0',
  rock: '#A2998C',
  darkRock: '#7D756B',
  snow: '#F4F8FC',
}

export const SCENE = {
  background: '#000000',
  light: '#FFFFFF',
  cloud: '#F7F9FC',
  atmosphere: '#4A9BFF',
  moonShades: ['#8E8E8E', '#A6A6A6', '#6F6F6F', '#BEBEBE'],
  satelliteBody: '#D4A63A',
  satellitePanel: '#1C2E5C',
  star: '#FFFFFF',
  starWarm: '#FFE2C2',
  starCool: '#C8D8FF',
}
