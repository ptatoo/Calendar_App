import { Dimensions } from 'react-native';

// --- CONSTANTS ---
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const HOUR_HEIGHT = 40;
export const HOUR_LABEL_WIDTH = 30;
export const DATE_HEADER_HEIGHT = 40;
export const EVENT_GAP = 10;
export const EVENT_OFFSET = 15;

export const GRID_COLOR = '#f0f0f0';
export const HEADER_BACKGROUND_COLOR = '#f0f0f0';

export const DEFAULT_COLORS = [
    '#ac725e', '#d06b64', '#f83a22', '#fa573c', '#ff7537', '#ffad46', '#fbe983', '#fad165',
    '#4986e7', '#9fc6e7', '#9fe1e7', '#92e1c0', '#42d692', '#16a765', '#7bd148', '#b3dc6c',
    '#444746', '#cabdbf', '#cca6ac', '#f691b2', '#cd74e6', '#a47ae2', '#9a9cff', '#b99aff',
]

export const PAST_BUFFER = 100; // ~6 years back
export const FUTURE_BUFFER = 100; // ~6 years forward