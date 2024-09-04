import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

const defaultValue = uuidv4();
const initialValue = browser ? window.localStorage.getItem('playerId') ?? defaultValue : defaultValue;

const playerId = writable<string>(initialValue);

playerId.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem('playerId', value);
  }
});

export default playerId;