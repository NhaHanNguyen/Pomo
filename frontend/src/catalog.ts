import type { HouseCategory, HouseKind } from './types';

export const CATEGORIES: { id: HouseCategory; label: string }[] = [
  { id: 'homes', label: 'Homes' },
  { id: 'shops', label: 'Shops' },
  { id: 'parks', label: 'Parks' },
  { id: 'civic', label: 'Civic' },
];

/**
 * Small House and Medium House come from the Figma shop panel; the rest fill out
 * the four category tabs it sketched but left empty.
 *
 * Prices are deliberately far above the Figma's 200 / 500, because the escalating
 * coin rate pays roughly 3,300 for a 25-minute cycle. Priced as designed, one
 * Pomodoro bought the entire catalogue. The scale here is ~15x, so:
 *
 *   Small House   3,000  ~1 cycle    the first thing you can afford
 *   Medium House  7,500  ~2 cycles
 *   Clock Tower  48,000  ~15 cycles  a genuine long-term goal
 *
 * `yield` is set near cost/30, so a building pays for itself over about thirty
 * cycles — a real investment rather than decoration.
 */
export const CATALOG: HouseKind[] = [
  {
    id: 'small-house',
    name: 'Small House',
    cost: 3000,
    keyCost: 1,
    yield: 100,
    size: 1,
    category: 'homes',
    palette: { wall: '#f6efe4', roof: '#e07a5f', trim: '#c25a3f' },
  },
  {
    id: 'medium-house',
    name: 'Medium House',
    cost: 7500,
    keyCost: 2,
    yield: 250,
    size: 2,
    category: 'homes',
    palette: { wall: '#fffdf9', roof: '#7fb8d9', trim: '#4f8fb5' },
  },
  {
    id: 'townhouse',
    name: 'Townhouse',
    cost: 18000,
    keyCost: 4,
    yield: 600,
    size: 3,
    category: 'homes',
    palette: { wall: '#f2cc8f', roof: '#c25a3f', trim: '#9c4530' },
  },
  {
    id: 'cafe',
    name: 'Corner Café',
    cost: 12000,
    keyCost: 3,
    yield: 400,
    size: 2,
    category: 'shops',
    palette: { wall: '#fffdf9', roof: '#81b29a', trim: '#5e8f77' },
  },
  {
    id: 'bakery',
    name: 'Bakery',
    cost: 22500,
    keyCost: 5,
    yield: 750,
    size: 2,
    category: 'shops',
    palette: { wall: '#f6efe4', roof: '#f0b429', trim: '#c8930f' },
  },
  {
    id: 'pocket-park',
    name: 'Pocket Park',
    cost: 5000,
    keyCost: 1,
    yield: 165,
    size: 1,
    category: 'parks',
    palette: { wall: '#81b29a', roof: '#5e8f77', trim: '#426b57' },
  },
  {
    id: 'fountain',
    name: 'Fountain Square',
    cost: 13500,
    keyCost: 3,
    yield: 450,
    size: 2,
    category: 'parks',
    palette: { wall: '#cfe6f2', roof: '#7fb8d9', trim: '#4f8fb5' },
  },
  {
    id: 'library',
    name: 'Library',
    cost: 30000,
    keyCost: 6,
    yield: 1000,
    size: 3,
    category: 'civic',
    palette: { wall: '#f6efe4', roof: '#6f675c', trim: '#3d3a36' },
  },
  {
    id: 'clock-tower',
    name: 'Clock Tower',
    cost: 48000,
    keyCost: 8,
    yield: 1600,
    size: 2,
    category: 'civic',
    palette: { wall: '#fffdf9', roof: '#e07a5f', trim: '#3d3a36' },
  },
];

export const kindById = (id: string): HouseKind =>
  CATALOG.find((k) => k.id === id) ?? CATALOG[0];
