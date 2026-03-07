import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Fuel, Loader2, MapPin, Navigation, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { type CNGStation, StationStatus } from "../hooks/useQueries";

interface StationCardProps {
  station: CNGStation;
  index: number;
}

export default function StationCard({ station, index }: StationCardProps) {
  const isOpen = station.status === StationStatus.open;
  const [isLocating, setIsLocating] = useState(false);

  const ocid = `stations.item.${index}`;

  const handleGetDirections = () => {
    const destination = encodeURIComponent(
      `${station.address}, ${station.city}`,
    );

    const openDirections = (origin?: string) => {
      const url = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      window.open(url, "_blank", "noopener,noreferrer");
    };

    if (!navigator.geolocation) {
      openDirections();
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        openDirections(`${latitude},${longitude}`);
        setIsLocating(false);
      },
      () => {
        openDirections();
        setIsLocating(false);
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  };

  return (
    <motion.div
      data-ocid={ocid}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      className={`station-card relative bg-card rounded-lg border border-border overflow-hidden shadow-xs ${isOpen ? "card-open" : "card-closed"}`}
    >
      {/* Card content with left offset for status accent */}
      <div className="pl-5 pr-4 pt-4 pb-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-base text-foreground leading-tight truncate">
              {station.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground font-body truncate">
                {station.city}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs font-body font-medium px-2 py-0.5 border ${
              isOpen
                ? "bg-status-open-bg text-status-open border-status-open/30"
                : "bg-status-closed-bg text-status-closed border-status-closed/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${isOpen ? "bg-status-open" : "bg-status-closed"}`}
            />
            {isOpen ? "Open" : "Closed"}
          </Badge>
        </div>

        {/* Address */}
        <p className="text-xs text-muted-foreground font-body mb-3 leading-relaxed line-clamp-2">
          {station.address}
        </p>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Fuel className="w-3 h-3 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-body leading-none mb-0.5">
                Price/kg
              </div>
              <div className="text-sm font-semibold text-foreground font-body">
                ₹{station.pricePerKg.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-3 h-3 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground font-body leading-none mb-0.5">
                Hours
              </div>
              <div className="text-xs font-medium text-foreground font-body truncate">
                {station.operatingHours}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 col-span-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-3 h-3 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground font-body leading-none mb-0.5">
                Phone
              </div>
              <a
                href={`tel:${station.phone}`}
                className="text-xs font-medium text-primary font-body hover:underline underline-offset-2"
              >
                {station.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Get Directions button */}
        <div className="mt-4 pt-3 border-t border-border/60">
          <Button
            data-ocid={`stations.item.${index}.button`}
            onClick={handleGetDirections}
            disabled={isLocating}
            className="w-full h-8 text-xs font-body font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
            size="sm"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Locating…
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                Get Directions
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
