/**
 * The customers the hero's "Live on Spenza" stage cycles through: where each
 * is live on the map. Its device beside the map is in Hero.astro. The stage
 * is in Spenza's colours throughout, whoever is on it.
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
    markets: [US], networks: 1,
  },
  {
    name: 'Angel Watch', word: 'Product', caption: 'Kids’ watch plans live in the US and UK', sub: "Kids' smartwatches",
    logo: angelWatch, logoH: 36, logoRatio: 350 / 120,
    markets: [US, UK], networks: 4,
  },
  {
    name: 'Butlr', word: 'Add On', caption: 'Sensor fleets across the US, UK and France', sub: 'Spatial intelligence sensors',
    logo: butlr, logoH: 26, logoRatio: 69 / 22,
    markets: [US, UK, FR], marketsLabel: 'regions live', networks: 20,
  },
];

export type HeroCustomer = (typeof HERO_CUSTOMERS)[number];

/** Where a market's label sits over the map, as an inline style. */
export const labelStyle = (m: Market, count: number) =>
  `left:${(m.x / 580) * 100}%;top:${(m.y / 216) * 100}%` + (m.ly && count > 2 ? `;margin-top:${m.ly}px` : '');
