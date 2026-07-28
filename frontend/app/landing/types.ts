export interface RoverItem {
  id: number;
  judul: string;
  sub_judul: string | null;
  deskripsi: string | null;
  image_url: string | null;
  created_at: string;
  // Dynamic telemetry fields from backend database
  status: string | null;
  launch_date: string | null;
  landing_date: string | null;
  landing_site: string | null;
  weight: string | null;
  dist_traveled: string | null;
  power_source: string | null;
}

export interface RoverStats {
  status: 'active' | 'retired' | 'lost';
  launchDate: string;
  landingDate: string;
  landingSite: string;
  weight: string;
  distTraveled: string;
  powerSource: string;
}
