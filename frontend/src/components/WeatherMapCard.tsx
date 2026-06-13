import { useMemo } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { ExpandIcon, LocationIcon } from './icons';
import type { Location } from '../types';

interface WeatherMapCardProps {
  locations: Location[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isExpanded: boolean;
  onExpand: () => void;
  onClose: () => void;
}

const singaporeCenter: [number, number] = [1.3521, 103.8198];
const defaultZoom = 11;

export function WeatherMapCard({
  locations,
  selectedId,
  onSelect,
  isExpanded,
  onExpand,
  onClose,
}: WeatherMapCardProps) {
  return (
    <>
      <MapShell
        locations={locations}
        selectedId={selectedId}
        onSelect={onSelect}
        interactive={false}
        title="Saved places across Singapore"
        actionLabel="Expand"
        onAction={onExpand}
        className="h-[20rem]"
      />
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#8baecc]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_38%),linear-gradient(180deg,rgba(212,230,248,0.18),rgba(45,73,96,0.14))]" />
          <div className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-100/70">
                Weather Map
              </p>
              <h2 className="mt-1 text-2xl font-light text-white">All saved locations</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-slate-900/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl hover:bg-slate-900/35"
            >
              Done
            </button>
          </div>
          <div className="relative z-10 flex-1 px-4 pb-4 sm:px-8 sm:pb-8">
            <MapShell
              locations={locations}
              selectedId={selectedId}
              onSelect={onSelect}
              interactive
              title="Explore and select a saved place"
              actionLabel="Close"
              onAction={onClose}
              className="h-full"
              hideHeader
            />
          </div>
        </div>
      )}
    </>
  );
}

interface MapShellProps {
  locations: Location[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  interactive: boolean;
  title: string;
  actionLabel: string;
  onAction: () => void;
  className: string;
  hideHeader?: boolean;
}

function MapShell({
  locations,
  selectedId,
  onSelect,
  interactive,
  title,
  actionLabel,
  onAction,
  className,
  hideHeader = false,
}: MapShellProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.08] shadow-[0_22px_60px_rgba(2,8,23,0.22)] backdrop-blur-xl">
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              <LocationIcon className="h-3.5 w-3.5" />
              <span>Map</span>
            </div>
            <p className="mt-1 text-sm text-white/75">{title}</p>
          </div>
          <button
            type="button"
            onClick={onAction}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/[0.14]"
          >
            <ExpandIcon className="h-3.5 w-3.5" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
      <div className={`relative bg-[#8eb4d8]/20 ${className}`}>
        <MapScene
          locations={locations}
          selectedId={selectedId}
          onSelect={onSelect}
          interactive={interactive}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#d4e6f8]/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2f4d67]/35 to-transparent" />
      </div>
    </section>
  );
}

function MapScene({
  locations,
  selectedId,
  onSelect,
  interactive,
}: {
  locations: Location[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  interactive: boolean;
}) {
  const center = useMemo<[number, number]>(() => {
    if (locations.length === 0) return singaporeCenter;

    const latitude =
      locations.reduce((sum, location) => sum + location.latitude, 0) / locations.length;
    const longitude =
      locations.reduce((sum, location) => sum + location.longitude, 0) / locations.length;
    return [latitude, longitude];
  }, [locations]);

  return (
    <MapContainer
      center={center}
      zoom={defaultZoom}
      className="weather-map h-full w-full"
      zoomControl={interactive}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      attributionControl={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitMapBounds locations={locations} />
      {locations.map((location) => {
        const selected = location.id === selectedId;
        return (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={pinIcon(selected)}
            eventHandlers={{ click: () => onSelect(location.id) }}
          >
            <Tooltip
              direction="top"
              offset={[0, -26]}
              opacity={1}
              permanent
              interactive={false}
              className={`weather-pin-tooltip ${selected ? 'is-selected' : ''}`}
            >
              <div className="flex flex-col">
                <span className="weather-pin-name">{locationLabel(location)}</span>
                <span className="weather-pin-meta">
                  {location.weather.temperature_c != null
                    ? `${Math.round(location.weather.temperature_c)}°`
                    : '--°'}
                  <span aria-hidden="true"> · </span>
                  {location.weather.condition || 'Unavailable'}
                </span>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

function FitMapBounds({ locations }: { locations: Location[] }) {
  const map = useMap();

  if (locations.length === 0) {
    map.setView(singaporeCenter, defaultZoom);
    return null;
  }

  if (locations.length === 1) {
    map.setView([locations[0].latitude, locations[0].longitude], 12);
    return null;
  }

  const bounds = latLngBounds(locations.map((location) => [location.latitude, location.longitude]));
  map.fitBounds(bounds.pad(0.45), { animate: false });
  return null;
}

function locationLabel(location: Location): string {
  return (
    location.weather.area || `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`
  );
}

function pinIcon(selected: boolean) {
  return divIcon({
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    tooltipAnchor: [0, -28],
    html: `
      <div class="weather-pin ${selected ? 'is-selected' : ''}">
        <div class="weather-pin-core"></div>
      </div>
    `,
  });
}
