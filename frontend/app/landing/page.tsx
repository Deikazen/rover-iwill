import React from 'react';
import LandingClient from './LandingClient';

// Ensure the page is dynamically rendered on every request to fetch fresh database data
export const dynamic = 'force-dynamic';

interface RoverItem {
  id: number;
  judul: string;
  sub_judul: string | null;
  deskripsi: string | null;
  image_url: string | null;
  created_at: string;
}

// Fetch items from the backend database server-side
async function getItems(): Promise<RoverItem[]> {
  try {
    const res = await fetch('http://127.0.0.1:8000/items/', {
      cache: 'no-store', // Disable caching to always get fresh data from the database
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from backend database: HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching database items from backend:', error);
    // Return an empty array if backend is down to handle it gracefully in the client component
    return [];
  }
}

export default async function LandingPage() {
  const initialItems = await getItems();

  return (
    <LandingClient initialItems={initialItems} />
  );
}