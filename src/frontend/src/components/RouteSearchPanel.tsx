import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ExternalLink, MapPin, Route } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { type CNGStation, useGetAllStations } from "../hooks/useQueries";
import StationCard from "./StationCard";

// ── Route definitions ─────────────────────────────────────────────
interface PresetRoute {
  from: string;
  to: string;
  label: string;
  distance: string;
  highway: string;
  intermediate?: string[];
  allCities?: string[];
}

const PRESET_ROUTES: PresetRoute[] = [
  // NH-33
  {
    from: "Ranchi",
    to: "Hazaribagh",
    label: "Ranchi → Hazaribagh",
    distance: "~65 km",
    highway: "NH-33",
    allCities: [
      "Ranchi",
      "Ormajhi",
      "Demotand",
      "Hesagarha",
      "Charhi",
      "Ramgarh",
      "Hazaribagh",
    ],
  },
  // NH-319
  {
    from: "Ranchi",
    to: "Patna",
    label: "Ranchi → Patna",
    distance: "~330 km",
    highway: "NH-319",
    allCities: [
      "Ranchi",
      "Ormajhi",
      "Demotand",
      "Hesagarha",
      "Charhi",
      "Ramgarh",
      "Bokaro",
      "Dhanbad",
      "Koderma",
      "Gaya",
      "Jehanabad",
      "Patna",
    ],
  },
  // NH-19 long
  {
    from: "Delhi",
    to: "Kolkata",
    label: "Delhi → Kolkata",
    distance: "~1475 km",
    highway: "NH-19",
    allCities: [
      "Delhi",
      "Noida",
      "Mathura",
      "Agra",
      "Kanpur",
      "Prayagraj",
      "Varanasi",
      "Sasaram",
      "Dehri",
      "Gaya",
      "Asansol",
      "Durgapur",
      "Burdwan",
      "Kolkata",
    ],
  },
  // NH-19 short
  {
    from: "Delhi",
    to: "Agra",
    label: "Delhi → Agra",
    distance: "~230 km",
    highway: "NH-19",
    allCities: ["Delhi", "Faridabad", "Palwal", "Mathura", "Vrindavan", "Agra"],
  },
  // NH-44
  {
    from: "Delhi",
    to: "Bangalore",
    label: "Delhi → Bangalore",
    distance: "~2100 km",
    highway: "NH-44",
    allCities: ["Delhi", "Gwalior", "Nagpur", "Hyderabad", "Bangalore"],
  },
  {
    from: "Bangalore",
    to: "Chennai",
    label: "Bangalore → Chennai",
    distance: "~345 km",
    highway: "NH-44",
    allCities: ["Bangalore", "Chennai"],
  },
  // NH-48
  {
    from: "Delhi",
    to: "Mumbai",
    label: "Delhi → Mumbai",
    distance: "~1420 km",
    highway: "NH-48",
    allCities: [
      "Delhi",
      "Gurgaon",
      "Jaipur",
      "Ajmer",
      "Udaipur",
      "Ahmedabad",
      "Vadodara",
      "Surat",
      "Mumbai",
    ],
  },
  {
    from: "Mumbai",
    to: "Pune",
    label: "Mumbai → Pune",
    distance: "~150 km",
    highway: "NH-48",
    allCities: [
      "Mumbai",
      "Thane",
      "Navi Mumbai",
      "Khopoli",
      "Lonavala",
      "Khandala",
      "Pune",
    ],
  },
  // NH-27
  {
    from: "Ahmedabad",
    to: "Raipur",
    label: "Ahmedabad → Raipur",
    distance: "~1100 km",
    highway: "NH-27",
    allCities: [
      "Ahmedabad",
      "Rajkot",
      "Indore",
      "Bhopal",
      "Jabalpur",
      "Raipur",
    ],
  },
  {
    from: "Raipur",
    to: "Patna",
    label: "Raipur → Patna",
    distance: "~700 km",
    highway: "NH-27",
    allCities: ["Raipur", "Ranchi", "Patna"],
  },
  // NH-31
  {
    from: "Lucknow",
    to: "Guwahati",
    label: "Lucknow → Guwahati",
    distance: "~1400 km",
    highway: "NH-31",
    allCities: [
      "Lucknow",
      "Gorakhpur",
      "Muzaffarpur",
      "Patna",
      "Purnea",
      "Siliguri",
      "Guwahati",
    ],
  },
  // NH-58
  {
    from: "Delhi",
    to: "Rishikesh",
    label: "Delhi → Rishikesh",
    distance: "~260 km",
    highway: "NH-58",
    allCities: ["Delhi", "Ghaziabad", "Meerut", "Haridwar", "Rishikesh"],
  },
  // NH-24
  {
    from: "Delhi",
    to: "Lucknow",
    label: "Delhi → Lucknow",
    distance: "~550 km",
    highway: "NH-24",
    allCities: ["Delhi", "Ghaziabad", "Moradabad", "Bareilly", "Lucknow"],
  },
  // NH-52
  {
    from: "Pathankot",
    to: "Haridwar",
    label: "Pathankot → Haridwar",
    distance: "~420 km",
    highway: "NH-52",
    allCities: ["Pathankot", "Jalandhar", "Ambala", "Chandigarh", "Haridwar"],
  },
  {
    from: "Jaipur",
    to: "Kota",
    label: "Jaipur → Kota",
    distance: "~250 km",
    highway: "NH-52",
    allCities: ["Jaipur", "Kota"],
  },
];

// ── Helper ────────────────────────────────────────────────────────
function findPreset(from: string, to: string): PresetRoute | undefined {
  const f = from.trim().toLowerCase();
  const t = to.trim().toLowerCase();
  return PRESET_ROUTES.find(
    (r) => r.from.toLowerCase() === f && r.to.toLowerCase() === t,
  );
}

function buildCityList(
  from: string,
  to: string,
  preset?: PresetRoute,
): string[] {
  if (preset?.allCities) return preset.allCities;
  const cities = [from.trim()];
  if (preset?.intermediate) cities.push(...preset.intermediate);
  cities.push(to.trim());
  return cities;
}

function initRouteState(autoLoad?: { from: string; to: string }) {
  if (!autoLoad) return null;
  const preset = findPreset(autoLoad.from, autoLoad.to);
  const cities = buildCityList(autoLoad.from, autoLoad.to, preset);
  return { from: autoLoad.from, to: autoLoad.to, cities, preset };
}

// ── Main component ────────────────────────────────────────────────
interface RouteSearchPanelProps {
  autoLoad?: { from: string; to: string };
}

export default function RouteSearchPanel({ autoLoad }: RouteSearchPanelProps) {
  const [fromCity, setFromCity] = useState(autoLoad?.from ?? "");
  const [toCity, setToCity] = useState(autoLoad?.to ?? "");
  const [searchActive, setSearchActive] = useState(() => !!autoLoad);
  const [activeRoute, setActiveRoute] = useState<{
    from: string;
    to: string;
    cities: string[];
    preset?: PresetRoute;
  } | null>(() => initRouteState(autoLoad));

  // Fetch ALL stations once and do client-side grouping
  const { data: allStations = [], isLoading, isFetching } = useGetAllStations();

  const loading = isLoading || isFetching;

  // Group all stations by city (keyed by trimmed original city name)
  // Also build a lowercase lookup so preset city names match stored data exactly
  const stationsByCity = useMemo(() => {
    // Map: original city name -> stations
    const map = new Map<string, CNGStation[]>();
    // Map: lowercase city name -> original city name (first seen)
    const lowerToOriginal = new Map<string, string>();

    for (const station of allStations) {
      const originalCity = station.city.trim();
      const lowerCity = originalCity.toLowerCase();
      // Use the first seen original casing as the canonical key
      const canonicalKey = lowerToOriginal.get(lowerCity) ?? originalCity;
      if (!lowerToOriginal.has(lowerCity)) {
        lowerToOriginal.set(lowerCity, canonicalKey);
      }
      const existing = map.get(canonicalKey) ?? [];
      map.set(canonicalKey, [...existing, station]);
    }
    return { map, lowerToOriginal };
  }, [allStations]);

  // Build ordered group list for active route
  const groupedResults = useMemo(() => {
    if (!activeRoute || !searchActive) return [];

    const { map, lowerToOriginal } = stationsByCity;
    const preset = activeRoute.preset;
    const orderedCities = preset?.allCities ?? [
      activeRoute.from,
      ...(preset?.intermediate ?? []),
      activeRoute.to,
    ];

    const routeGroups: Array<{ city: string; stations: CNGStation[] }> = [];
    const seenKeys = new Set<string>();

    // Only show cities that are part of the route (in order)
    for (const city of orderedCities) {
      // Resolve the stored canonical key via case-insensitive lookup
      const canonicalKey =
        lowerToOriginal.get(city.trim().toLowerCase()) ?? city.trim();
      if (!seenKeys.has(canonicalKey)) {
        const stations = map.get(canonicalKey) ?? [];
        routeGroups.push({ city, stations });
        seenKeys.add(canonicalKey);
      }
    }

    // For custom (non-preset) routes, also include cities that partially match from/to
    if (!preset) {
      const fromLower = activeRoute.from.trim().toLowerCase();
      const toLower = activeRoute.to.trim().toLowerCase();
      for (const [canonicalKey, stations] of map.entries()) {
        if (!seenKeys.has(canonicalKey)) {
          const cityLower = canonicalKey.toLowerCase();
          if (
            cityLower.includes(fromLower) ||
            fromLower.includes(cityLower) ||
            cityLower.includes(toLower) ||
            toLower.includes(cityLower)
          ) {
            routeGroups.push({ city: canonicalKey, stations });
            seenKeys.add(canonicalKey);
          }
        }
      }
    }

    return routeGroups;
  }, [activeRoute, searchActive, stationsByCity]);

  const totalAll = groupedResults.reduce(
    (acc, g) => acc + (g.stations?.length ?? 0),
    0,
  );
  const totalActive = groupedResults.reduce(
    (acc, g) => acc + (g.stations?.filter((s) => s.isActive).length ?? 0),
    0,
  );

  const handleSearch = () => {
    const f = fromCity.trim();
    const t = toCity.trim();
    if (!f || !t) return;
    const preset = findPreset(f, t);
    const cities = buildCityList(f, t, preset);
    setActiveRoute({ from: f, to: t, cities, preset });
    setSearchActive(true);
  };

  const handlePresetClick = (preset: PresetRoute) => {
    setFromCity(preset.from);
    setToCity(preset.to);
    const cities = buildCityList(preset.from, preset.to, preset);
    setActiveRoute({
      from: preset.from,
      to: preset.to,
      cities,
      preset,
    });
    setSearchActive(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const mapsUrl = activeRoute
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(activeRoute.from)}&destination=${encodeURIComponent(activeRoute.to)}&travelmode=driving`
    : "#";

  return (
    <div className="w-full">
      {/* ── Input area ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-search rounded-xl p-3 max-w-xl mx-auto shadow-2xl"
      >
        {/* From / To inputs */}
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-300 pointer-events-none" />
            <input
              type="text"
              placeholder="From city…"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              onKeyDown={handleKeyDown}
              data-ocid="route.from_input"
              className="w-full pl-9 pr-3 py-2.5 bg-white/10 rounded-lg text-white placeholder:text-white/50 font-body text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
            />
          </div>

          <div className="flex items-center justify-center sm:px-1">
            <ArrowRight className="w-4 h-4 text-white/40" />
          </div>

          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-300 pointer-events-none" />
            <input
              type="text"
              placeholder="To city…"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              onKeyDown={handleKeyDown}
              data-ocid="route.to_input"
              className="w-full pl-9 pr-3 py-2.5 bg-white/10 rounded-lg text-white placeholder:text-white/50 font-body text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
            />
          </div>
        </div>

        <Button
          onClick={handleSearch}
          data-ocid="route.submit_button"
          disabled={!fromCity.trim() || !toCity.trim()}
          className="w-full bg-white text-primary hover:bg-white/90 font-body font-semibold text-sm h-10 disabled:opacity-50"
        >
          <Route className="w-4 h-4 mr-1.5" />
          Find CNG Stations on Route
        </Button>
      </motion.div>

      {/* ── Preset chips ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-3"
      >
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Route className="w-3 h-3 text-white/40 shrink-0" />
          <span className="text-white/40 text-xs font-body shrink-0">
            Quick NH routes:
          </span>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {PRESET_ROUTES.map((preset, idx) => (
            <button
              key={preset.label}
              type="button"
              data-ocid={`route.item.${idx + 1}`}
              onClick={() => handlePresetClick(preset)}
              className="shrink-0 text-xs text-white/70 hover:text-white font-body px-2.5 py-1.5 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <span className="bg-white/15 text-white/90 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                {preset.highway}
              </span>
              <span>{preset.label}</span>
              <span className="text-white/35 text-[10px]">
                {preset.distance}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Results section ── */}
      <AnimatePresence mode="wait">
        {searchActive && activeRoute && (
          <motion.div
            key="route-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
          >
            {/* Route info banner */}
            <div className="route-banner mx-4 sm:mx-0 mb-6 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Route className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-display font-bold text-foreground text-base flex items-center gap-1.5">
                    {activeRoute.from}
                    <ArrowRight className="w-4 h-4 text-primary/70" />
                    {activeRoute.to}
                    {activeRoute.preset?.intermediate && (
                      <span className="text-muted-foreground font-body text-xs font-normal">
                        via {activeRoute.preset.intermediate.join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activeRoute.preset && (
                      <>
                        <Badge
                          variant="outline"
                          className="text-xs font-body px-2 py-0 h-5 border-primary/30 text-primary bg-primary/5"
                        >
                          {activeRoute.preset.distance}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs font-body px-2 py-0 h-5 border-border text-muted-foreground"
                        >
                          {activeRoute.preset.highway}
                        </Badge>
                      </>
                    )}
                    {!loading && totalAll > 0 && (
                      <span className="text-xs text-muted-foreground font-body">
                        {activeRoute.preset
                          ? `${totalAll} stations — route cities listed first`
                          : `${totalActive} active / ${totalAll} total stations`}
                      </span>
                    )}
                    {!loading && totalAll === 0 && (
                      <span className="text-xs text-muted-foreground font-body">
                        0 stations found
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
                data-ocid="route.open_maps_button"
                className="shrink-0 font-body text-xs border-primary/30 text-primary hover:bg-primary/5 h-8"
              >
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Open in Google Maps
                </a>
              </Button>
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div
                data-ocid="route.loading_state"
                className="px-4 sm:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {Array.from({ length: 6 }, (_, i) => `rskel-${i}`).map(
                  (key) => (
                    <div
                      key={key}
                      className="bg-card rounded-lg border border-border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Skeleton className="h-8 rounded-md" />
                        <Skeleton className="h-8 rounded-md" />
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Grouped results */}
            {!loading &&
              groupedResults.map((group) => {
                const groupStations = group.stations ?? [];
                const activeCount = groupStations.filter(
                  (s) => s.isActive,
                ).length;

                return (
                  <motion.section
                    key={group.city}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-8 px-4 sm:px-0"
                  >
                    {/* City divider */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 rounded-full bg-primary" />
                        <h3 className="font-display font-bold text-lg text-foreground">
                          Stations in {group.city}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className="text-xs font-body bg-status-open-bg text-status-open border-status-open/30 font-medium">
                          {activeCount} active
                        </Badge>
                        {groupStations.length - activeCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-body text-muted-foreground"
                          >
                            {groupStations.length - activeCount} inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Station grid or empty */}
                    {groupStations.length === 0 ? (
                      <div
                        data-ocid="route.empty_state"
                        className="text-center py-10 bg-muted/40 rounded-xl border border-dashed border-border"
                      >
                        <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-body">
                          No CNG stations found in {group.city}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groupStations.map((station, idx) => (
                          <StationCard
                            key={station.id.toString()}
                            station={station}
                            index={idx + 1}
                          />
                        ))}
                      </div>
                    )}
                  </motion.section>
                );
              })}

            {/* Fully empty state (all cities returned nothing) */}
            {!loading && totalAll === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                data-ocid="route.error_state"
                className="text-center py-16"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <Route className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  No stations found on this route
                </h3>
                <p className="text-muted-foreground font-body text-sm max-w-xs mx-auto">
                  Try different city names or check the spellings.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
