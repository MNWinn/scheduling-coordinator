'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Component to update map center when activities change
function MapUpdater({ activities }: { activities: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (activities.length > 0) {
            const bounds = L.latLngBounds(activities.map(a => [a.location?.lat || 0, a.location?.lng || 0]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [activities, map]);

    return null;
}

type MapComponentProps = {
    activities: any[];
};

export default function MapComponent({ activities }: MapComponentProps) {
    // Filter out activities without location data
    const validActivities = activities.filter(a => a.location?.lat && a.location?.lng);

    // Default center (Babylon, NY)
    const defaultCenter: [number, number] = [40.6957, -73.3257];

    // Leaflet needs window to be defined, so we check for mount
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);

        // Fix leafet icon path issue
        // We'll need to manually ensure these images are available or use CDN
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

    }, []);

    if (!mounted) return <div className="h-full w-full bg-muted animate-pulse rounded-lg" />;

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border z-0">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validActivities.map((activity) => (
                    <Marker
                        key={activity.id}
                        position={[activity.location!.lat!, activity.location!.lng!]}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <h3 className="font-semibold text-sm">{activity.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{activity.location?.name}</p>
                                <Link prefetch={false} href={`/activities/${activity.id}`} className="text-xs text-primary hover:underline">
                                    View Details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapUpdater activities={validActivities} />
            </MapContainer>
        </div>
    );
}
