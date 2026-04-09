import { Dimensions } from 'react-native';

// --- CONSTANTS ---
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;
export const HOUR_HEIGHT = 40;
export const HOUR_LABEL_WIDTH = 40;
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
export const PASTEL_COLORS = [
    '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', 
    '#fffffc',
]
export const DEAFULT_COLORS_2 = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#6B7280'];

export const DRAWER_DRAGGABLE_HEIGHT = 36;

export const PAST_BUFFER = 100; // ~6 years back
export const FUTURE_BUFFER = 100; // ~6 years forward