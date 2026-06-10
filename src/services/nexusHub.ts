
export interface NexusHubPrice {
  itemId: number;
  name: string;
  uniqueName: string;
  marketValue: number;
  minBuyout: number;
  quantity: number;
  lastCheck: string;
}

export interface NexusHubRealm {
  name: string;
  slug: string;
  faction: 'alliance' | 'horde';
  region: string;
}

const BASE_URL = 'https://api.nexushub.co/wow-classic/v1';
const PROXY_URL = 'https://api.allorigins.win/get?url=';

export async function fetchRealms(): Promise<NexusHubRealm[]> {
  const resp = await fetch(`${PROXY_URL}${encodeURIComponent(BASE_URL + '/realms')}`);
  if (!resp.ok) throw new Error('Failed to fetch realms from proxy');
  const wrapper = await resp.json();
  const data = JSON.parse(wrapper.contents);
  return data.realms;
}

export async function fetchPrices(realmSlug: string): Promise<NexusHubPrice[]> {
  const resp = await fetch(`${PROXY_URL}${encodeURIComponent(BASE_URL + '/items/' + realmSlug)}`);
  if (!resp.ok) throw new Error(`Failed to fetch prices from proxy for ${realmSlug}`);
  const wrapper = await resp.json();
  const data = JSON.parse(wrapper.contents);
  return data.items;
}

// Fetch a single item price if needed
export async function fetchItemPrice(realmSlug: string, itemSlug: string): Promise<NexusHubPrice> {
  const resp = await fetch(`${PROXY_URL}${encodeURIComponent(BASE_URL + '/items/' + realmSlug + '/' + itemSlug)}`);
  if (!resp.ok) throw new Error(`Failed to fetch price from proxy for ${itemSlug}`);
  const wrapper = await resp.json();
  return JSON.parse(wrapper.contents);
}
