/**
 * The customers the hero's "Live on Spenza" stage cycles through: where each
 * is live on the map and its brand colours. Its device beside the map is in
 * Hero.astro.
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
    logo: rocketPhone, logoH: 24, logoRatio: 540 / 96,
    brand: { brand: '#5d2dce', text: '#5d2dce', line: '#ddd3fa', bar: '#5d2dce', btn: '#5d2dce', screen: '#f5f3ff' },
    markets: [US], networks: 1,
  },
  {
    name: 'Angel Watch', word: 'Product', caption: 'Kids’ watch plans live in the US and UK', sub: "Kids' smartwatches",
    logo: angelWatch, logoH: 36, logoRatio: 350 / 120,
    brand: { brand: '#e60e6e', text: '#c30b5d', line: '#f6c6da', bar: 'linear-gradient(90deg, #16bae5, #e60e6e 55%, #ed7b09)', btn: '#111111', screen: '#fdf8fa' },
    markets: [US, UK], networks: 4,
  },
  {
    name: 'Butlr', word: 'Add On', caption: 'Sensor fleets across the US, UK and France', sub: 'Spatial intelligence sensors',
    logo: butlr, logoH: 26, logoRatio: 69 / 22,
    brand: { brand: '#ff3d00', text: '#c73000', line: '#ffd0bf', bar: '#ff3d00', btn: '#2a2a2d', screen: '#f6f7f9' },
    markets: [US, UK, FR], networks: 20,
  },
];

export type HeroCustomer = (typeof HERO_CUSTOMERS)[number];

/** The stage's colour variables for one customer, as an inline style. */
export const brandStyle = ({ brand: b }: HeroCustomer) =>
  `--brand:${b.brand};--brand-text:${b.text};--brand-line:${b.line};--brand-bar:${b.bar};--brand-btn:${b.btn};--screen:${b.screen}`;

/** Where a market's label sits over the map, as an inline style. */
export const labelStyle = (m: Market, count: number) =>
  `left:${(m.x / 580) * 100}%;top:${(m.y / 216) * 100}%` + (m.ly && count > 2 ? `;margin-top:${m.ly}px` : '');
