/**
 * The customers the hero's "Live on Spenza" stage cycles through: where each
 * is live on the map, its brand colours, and what its own customer app shows.
 * Hero.astro renders the first one into the markup; scripts/home-hero.js
 * swaps in the others from the same data. `word` finishes the headline —
 * "Your Next Product." — while that customer is on screen.
 */
import angelWatch from '../../assets/home/customers/angel-watch.webp?url';
import butlr from '../../assets/home/customers/butlr.svg?url';
import rocketPhone from '../../assets/home/customers/rocketphone.webp?url';

export interface Market { name: string; x: number; y: number; ly?: number }

const UK: Market = { name: 'United Kingdom', x: 287.6, y: 40.3, ly: -11 };
const FR: Market = { name: 'France', x: 294.0, y: 50.8, ly: 11 };
const US: Market = { name: 'United States', x: 132.1, y: 62.9 };

export const HERO_CUSTOMERS = [
  {
    name: 'RocketPhone', word: 'Service', caption: 'Branded US mobile line for Salesforce users', sub: 'Salesforce-native mobile',
    logo: rocketPhone, logoH: [24, 16], logoRatio: 540 / 96,
    brand: { brand: '#5d2dce', text: '#5d2dce', line: '#ddd3fa', bar: '#5d2dce', btn: '#5d2dce', screen: '#f5f3ff' },
    markets: [US], networks: 1,
    phone: {
      aLabel: 'Call logged', aText: 'Your call with a prospect was recorded, transcribed and saved to Salesforce.', aBtn: 'View record',
      plL: 'Your line', plN: 'RocketCell · United States', plBig: '+1', plCap: 'Works on any phone. No app needed.',
      rows: [['Call recording', 'On'], ['Salesforce sync', 'Live']],
    },
  },
  {
    name: 'Angel Watch', word: 'Product', caption: 'Kids’ watch plans live in the US and UK', sub: "Kids' smartwatches",
    logo: angelWatch, logoH: [36, 26], logoRatio: 350 / 120,
    brand: { brand: '#e60e6e', text: '#c30b5d', line: '#f6c6da', bar: 'linear-gradient(90deg, #16bae5, #e60e6e 55%, #ed7b09)', btn: '#111111', screen: '#fdf8fa' },
    markets: [US, UK], networks: 4,
    phone: {
      aLabel: 'Arrived safely', aText: "Maya's watch checked in at school. GPS and SOS are on.", aBtn: 'View map',
      plL: "Maya's watch", plN: 'Angel Watch · connected', plBig: 'Online', plCap: 'Pay-per-use data · US and UK',
      rows: [['SOS alerts', 'On'], ['GPS tracking', 'Live']],
    },
  },
  {
    name: 'Butlr', word: 'Add On', caption: 'Sensor fleets across the US, UK and France', sub: 'Spatial intelligence sensors',
    logo: butlr, logoH: [26, 18], logoRatio: 69 / 22,
    brand: { brand: '#ff3d00', text: '#c73000', line: '#ffd0bf', bar: '#ff3d00', btn: '#2a2a2d', screen: '#f6f7f9' },
    markets: [US, UK, FR], networks: 20,
    phone: {
      aLabel: 'Occupancy alert', aText: 'Floor 4 is at 18% occupancy today. Close it to save energy?', aBtn: 'View floor',
      plL: 'Connectivity', plN: 'Sensor fleet · cellular', plBig: 'Live', plCap: 'Sensor data from US, UK and France sites',
      rows: [['Occupancy data', 'Real time'], ['Billing', 'One invoice']],
    },
  },
];

export type HeroCustomer = (typeof HERO_CUSTOMERS)[number];

/** The stage's colour variables for one customer, as an inline style. */
export const brandStyle = ({ brand: b }: HeroCustomer) =>
  `--brand:${b.brand};--brand-text:${b.text};--brand-line:${b.line};--brand-bar:${b.bar};--brand-btn:${b.btn};--screen:${b.screen}`;

/** Where a market's label sits over the map, as an inline style. */
export const labelStyle = (m: Market, count: number) =>
  `left:${(m.x / 580) * 100}%;top:${(m.y / 216) * 100}%` + (m.ly && count > 2 ? `;margin-top:${m.ly}px` : '');
