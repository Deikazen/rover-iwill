import { RoverItem, RoverStats } from './types';

export const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
];

// Dynamically extract stats from the database item with safe defaults
export const getRoverStats = (item: RoverItem): RoverStats => {
  return {
    status: (item.status || 'active') as 'active' | 'retired' | 'lost',
    launchDate: item.launch_date || 'TBD',
    landingDate: item.landing_date || 'TBD',
    landingSite: item.landing_site || 'Belum Ditentukan',
    weight: item.weight || 'TBD',
    distTraveled: item.dist_traveled || '0 km',
    powerSource: item.power_source || 'Panel Surya'
  };
};
