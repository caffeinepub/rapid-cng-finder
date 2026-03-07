import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type CNGStation,
  type StationFormData,
  StationStatus,
} from "../hooks/useQueries";

interface StationFormProps {
  station?: CNGStation | null;
  onSubmit: (data: StationFormData) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
}

const defaultForm: StationFormData = {
  name: "",
  address: "",
  city: "",
  operatingHours: "",
  pricePerKg: 0,
  status: StationStatus.open,
  phone: "",
  isActive: true,
};

interface FormErrors {
  name?: string;
  address?: string;
  city?: string;
  operatingHours?: string;
  pricePerKg?: string;
  phone?: string;
}

export default function StationForm({
  station,
  onSubmit,
  onCancel,
  isPending,
}: StationFormProps) {
  const [form, setForm] = useState<StationFormData>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = !!station;

  useEffect(() => {
    if (station) {
      setForm({
        name: station.name,
        address: station.address,
        city: station.city,
        operatingHours: station.operatingHours,
        pricePerKg: station.pricePerKg,
        status: station.status,
        phone: station.phone,
        isActive: station.isActive,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [station]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Station name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.operatingHours.trim())
      newErrors.operatingHours = "Operating hours are required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.pricePerKg || form.pricePerKg <= 0)
      newErrors.pricePerKg = "Valid price is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const update = (
    key: keyof StationFormData,
    value: StationFormData[keyof StationFormData],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display font-bold text-xl">
          {isEdit ? "Edit Station" : "Add New Station"}
        </DialogTitle>
        <DialogDescription className="font-body text-sm">
          {isEdit
            ? "Update the station details below."
            : "Fill in the details to add a new CNG station."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2" noValidate>
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="sf-name" className="font-body text-sm font-medium">
            Station Name *
          </Label>
          <Input
            id="sf-name"
            data-ocid="station_form.name_input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. City Gas CNG Station"
            className={`font-body text-sm ${errors.name ? "border-destructive" : ""}`}
          />
          {errors.name && (
            <p className="text-xs text-destructive font-body">{errors.name}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <Label htmlFor="sf-city" className="font-body text-sm font-medium">
            City *
          </Label>
          <Input
            id="sf-city"
            data-ocid="station_form.city_input"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="e.g. Mumbai"
            className={`font-body text-sm ${errors.city ? "border-destructive" : ""}`}
          />
          {errors.city && (
            <p className="text-xs text-destructive font-body">{errors.city}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="sf-address" className="font-body text-sm font-medium">
            Address *
          </Label>
          <Input
            id="sf-address"
            data-ocid="station_form.address_input"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="e.g. 42 MG Road, Andheri West"
            className={`font-body text-sm ${errors.address ? "border-destructive" : ""}`}
          />
          {errors.address && (
            <p className="text-xs text-destructive font-body">
              {errors.address}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="sf-phone" className="font-body text-sm font-medium">
            Phone *
          </Label>
          <Input
            id="sf-phone"
            data-ocid="station_form.phone_input"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="e.g. +91 98765 43210"
            className={`font-body text-sm ${errors.phone ? "border-destructive" : ""}`}
          />
          {errors.phone && (
            <p className="text-xs text-destructive font-body">{errors.phone}</p>
          )}
        </div>

        {/* Operating Hours */}
        <div className="space-y-1.5">
          <Label htmlFor="sf-hours" className="font-body text-sm font-medium">
            Operating Hours *
          </Label>
          <Input
            id="sf-hours"
            data-ocid="station_form.hours_input"
            value={form.operatingHours}
            onChange={(e) => update("operatingHours", e.target.value)}
            placeholder="e.g. 24/7 or 6:00 AM – 10:00 PM"
            className={`font-body text-sm ${errors.operatingHours ? "border-destructive" : ""}`}
          />
          {errors.operatingHours && (
            <p className="text-xs text-destructive font-body">
              {errors.operatingHours}
            </p>
          )}
        </div>

        {/* Price + Status row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sf-price" className="font-body text-sm font-medium">
              Price per kg (₹) *
            </Label>
            <Input
              id="sf-price"
              data-ocid="station_form.price_input"
              type="number"
              step="0.01"
              min="0"
              value={form.pricePerKg || ""}
              onChange={(e) =>
                update("pricePerKg", Number.parseFloat(e.target.value) || 0)
              }
              placeholder="e.g. 82.50"
              className={`font-body text-sm ${errors.pricePerKg ? "border-destructive" : ""}`}
            />
            {errors.pricePerKg && (
              <p className="text-xs text-destructive font-body">
                {errors.pricePerKg}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="font-body text-sm font-medium">Status *</Label>
            <Select
              value={form.status}
              onValueChange={(v) => update("status", v as StationStatus)}
            >
              <SelectTrigger
                data-ocid="station_form.status_select"
                className="font-body text-sm"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={StationStatus.open}
                  className="font-body text-sm"
                >
                  Open
                </SelectItem>
                <SelectItem
                  value={StationStatus.closed}
                  className="font-body text-sm"
                >
                  Closed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
          <div>
            <Label
              htmlFor="sf-active"
              className="font-body text-sm font-medium cursor-pointer"
            >
              Active Station
            </Label>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Only active stations appear in public search
            </p>
          </div>
          <Switch
            id="sf-active"
            data-ocid="station_form.active_switch"
            checked={form.isActive}
            onCheckedChange={(v) => update("isActive", v)}
          />
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            data-ocid="station_form.cancel_button"
            className="font-body text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-ocid="station_form.submit_button"
            className="font-body text-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? "Saving…" : "Adding…"}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Station"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
