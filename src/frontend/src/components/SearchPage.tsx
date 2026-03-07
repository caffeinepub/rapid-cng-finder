import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Route, Search, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useGetAllStations, useSearchByCity } from "../hooks/useQueries";
import RouteSearchPanel from "./RouteSearchPanel";
import StationCard from "./StationCard";

type SearchMode = "city" | "route";

export default function SearchPage() {
  const [mode, setMode] = useState<SearchMode>("city");
  const [searchInput, setSearchInput] = useState("");
  const [activeCity, setActiveCity] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allStations = [], isLoading: loadingAll } = useGetAllStations();
  const {
    data: searchResults = [],
    isLoading: loadingSearch,
    isFetching: fetchingSearch,
  } = useSearchByCity(activeCity, activeCity.length > 0);

  const isSearching = activeCity.length > 0;
  const isLoading = isSearching ? loadingSearch || fetchingSearch : loadingAll;

  const rawStations = isSearching ? searchResults : allStations;
  const stations = rawStations.filter((s) => s.isActive);

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setActiveCity(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setSearchInput("");
    setActiveCity("");
    inputRef.current?.focus();
  };

  const popularCities = [
    "Ranchi",
    "Hazaribagh",
    "Delhi",
    "Mumbai",
    "Bangalore",
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-bg hex-pattern relative overflow-hidden">
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Icon + badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-2 mb-5"
            >
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                <Zap className="w-3.5 h-3.5 text-green-300" />
                <span className="text-xs text-green-200 font-body font-medium">
                  Cleaner Fuel, Smarter Choice
                </span>
              </div>
            </motion.div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight mb-3">
              Find CNG Stations
              <span className="block text-green-300">Near You</span>
            </h1>
            <p className="text-white/70 font-body text-base sm:text-lg mb-6 leading-relaxed">
              Search across hundreds of verified CNG stations with real-time
              pricing and availability.
            </p>

            {/* Mode tab switcher */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1 mb-6"
            >
              <button
                type="button"
                data-ocid="search.tab"
                onClick={() => setMode("city")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all ${
                  mode === "city"
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                City Search
              </button>
              <button
                type="button"
                data-ocid="route.tab"
                onClick={() => setMode("route")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all ${
                  mode === "route"
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                Route Search
              </button>
            </motion.div>

            <AnimatePresence mode="wait">
              {mode === "city" ? (
                <motion.div
                  key="city-search"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Search Bar */}
                  <div className="glass-search rounded-xl p-1.5 flex gap-2 max-w-xl mx-auto shadow-2xl">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search by city name…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        data-ocid="search.search_input"
                        className="w-full pl-9 pr-3 py-2.5 bg-transparent text-white placeholder:text-white/50 font-body text-sm focus:outline-none"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      data-ocid="search.submit_button"
                      className="shrink-0 bg-white text-primary hover:bg-white/90 font-body font-semibold text-sm px-5 py-2.5 h-auto"
                    >
                      <Search className="w-4 h-4 mr-1.5" />
                      Search
                    </Button>
                  </div>

                  {/* Popular cities */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <span className="text-white/40 text-xs font-body">
                      Popular:
                    </span>
                    {popularCities.map((city) => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => {
                          setSearchInput(city);
                          setActiveCity(city);
                        }}
                        className="text-xs text-white/60 hover:text-white font-body px-2 py-0.5 rounded-full border border-white/20 hover:border-white/40 transition-all"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="route-search-hero"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <RouteSearchPanel
                    autoLoad={{ from: "Ranchi", to: "Hazaribagh" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* City Search Results Section — only shown in city mode */}
      {mode === "city" && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-10">
          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {isSearching ? (
                <h2 className="font-display font-semibold text-xl text-foreground">
                  Results for{" "}
                  <span className="text-primary">"{activeCity}"</span>
                </h2>
              ) : (
                <h2 className="font-display font-semibold text-xl text-foreground">
                  All CNG Stations
                </h2>
              )}
              {!isLoading && (
                <p className="text-sm text-muted-foreground font-body mt-0.5">
                  {stations.length} station{stations.length !== 1 ? "s" : ""}{" "}
                  found
                  {isSearching && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="ml-2 text-primary hover:underline underline-offset-2 text-xs"
                    >
                      Clear search
                    </button>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Loading skeletons */}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-ocid="stations.loading_state"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {Array.from({ length: 8 }, (_, i) => `skel-${i}`).map((key) => (
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
                ))}
              </motion.div>
            )}

            {/* Empty state */}
            {!isLoading && stations.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                data-ocid="stations.empty_state"
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  {isSearching
                    ? `No stations in "${activeCity}"`
                    : "No stations available"}
                </h3>
                <p className="text-muted-foreground font-body text-sm max-w-xs mx-auto">
                  {isSearching
                    ? "Try a different city name or check the spelling."
                    : "No CNG stations have been added yet."}
                </p>
                {isSearching && (
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="mt-4 font-body text-sm"
                  >
                    Show all stations
                  </Button>
                )}
              </motion.div>
            )}

            {/* Station grid */}
            {!isLoading && stations.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="stations.list"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {stations.map((station, index) => (
                  <StationCard
                    key={station.id.toString()}
                    station={station}
                    index={index + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}
