import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  Database,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type CNGStation,
  type StationFormData,
  StationStatus,
  useAddStation,
  useDeleteStation,
  useGetAllStations,
  usePreloadSampleData,
  useUpdateStation,
} from "../hooks/useQueries";
import StationForm from "./StationForm";

export default function AdminDashboard() {
  const [stationDialogOpen, setStationDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<CNGStation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CNGStation | null>(null);

  const { data: stations = [], isLoading } = useGetAllStations();
  const preloadMutation = usePreloadSampleData();
  const addMutation = useAddStation();
  const updateMutation = useUpdateStation();
  const deleteMutation = useDeleteStation();

  const hasStations = stations.length > 0;
  const isPending = addMutation.isPending || updateMutation.isPending;

  const handleOpenAdd = () => {
    setEditingStation(null);
    setStationDialogOpen(true);
  };

  const handleOpenEdit = (station: CNGStation) => {
    setEditingStation(station);
    setStationDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setStationDialogOpen(false);
    setEditingStation(null);
  };

  const handleSubmit = async (data: StationFormData) => {
    try {
      if (editingStation) {
        await updateMutation.mutateAsync({ id: editingStation.id, data });
        toast.success("Station updated successfully");
      } else {
        await addMutation.mutateAsync(data);
        toast.success("Station added successfully");
      }
      handleCloseDialog();
    } catch (_err) {
      toast.error("Failed to save station. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" has been deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete station. Please try again.");
    }
  };

  const handlePreload = async () => {
    try {
      await preloadMutation.mutateAsync();
      toast.success("Sample data loaded successfully!");
    } catch {
      toast.error("Failed to load sample data.");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
      {/* Admin header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            Manage all CNG station listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasStations && !isLoading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreload}
              disabled={preloadMutation.isPending}
              data-ocid="admin.preload_button"
              className="font-body text-sm border-primary/30 hover:bg-primary/5"
            >
              {preloadMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5 mr-1.5" />
              )}
              Load Sample Data
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleOpenAdd}
            data-ocid="admin.add_station_button"
            className="font-body text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Station
          </Button>
        </div>
      </motion.div>

      {/* Stats row */}
      {!isLoading && hasStations && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            {
              label: "Total Stations",
              value: stations.length,
              color: "text-foreground",
            },
            {
              label: "Active",
              value: stations.filter((s) => s.isActive).length,
              color: "text-status-open",
            },
            {
              label: "Inactive",
              value: stations.filter((s) => !s.isActive).length,
              color: "text-muted-foreground",
            },
            {
              label: "Currently Open",
              value: stations.filter((s) => s.status === StationStatus.open)
                .length,
              color: "text-primary",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-3 sm:p-4"
            >
              <div className={`font-display font-bold text-2xl ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground font-body mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-lg overflow-hidden"
      >
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }, (_, i) => `skel-${i}`).map((key) => (
              <div key={key} className="flex items-center gap-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : stations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-1">
              No stations yet
            </h3>
            <p className="text-sm text-muted-foreground font-body mb-4">
              Add your first station or load sample data to get started.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreload}
                className="font-body text-sm"
              >
                <Database className="w-3.5 h-3.5 mr-1.5" />
                Load Sample Data
              </Button>
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="font-body text-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Station
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="station_table.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-body font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                    Name
                  </TableHead>
                  <TableHead className="font-body font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                    City
                  </TableHead>
                  <TableHead className="font-body font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                    Price/kg
                  </TableHead>
                  <TableHead className="font-body font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                    Status
                  </TableHead>
                  <TableHead className="font-body font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                    Active
                  </TableHead>
                  <TableHead className="font-body font-semibold text-xs text-muted-foreground uppercase tracking-wide text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map((station) => (
                  <TableRow
                    key={station.id.toString()}
                    data-ocid="station_table.row"
                    className="border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-3">
                      <div className="font-body font-medium text-sm text-foreground">
                        {station.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-body truncate max-w-[180px]">
                        {station.address}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-body text-sm text-foreground">
                        {station.city}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-body font-semibold text-sm text-foreground">
                        ₹{station.pricePerKg.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs font-body px-2 py-0.5 border ${
                          station.status === StationStatus.open
                            ? "bg-status-open-bg text-status-open border-status-open/30"
                            : "bg-status-closed-bg text-status-closed border-status-closed/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${
                            station.status === StationStatus.open
                              ? "bg-status-open"
                              : "bg-status-closed"
                          }`}
                        />
                        {station.status === StationStatus.open
                          ? "Open"
                          : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {station.isActive ? (
                        <span className="flex items-center gap-1 text-status-open text-xs font-body">
                          <ToggleRight className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                          <ToggleLeft className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(station)}
                          data-ocid="station_table.edit_button"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(station)}
                          data-ocid="station_table.delete_button"
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Station Form Dialog */}
      <Dialog
        open={stationDialogOpen}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent
          data-ocid="station_form.dialog"
          className="max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <StationForm
            station={editingStation}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="delete_confirm.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold">
              Delete Station?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm">
              Are you sure you want to delete{" "}
              <strong>"{deleteTarget?.name}"</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="delete_confirm.cancel_button"
              className="font-body text-sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="delete_confirm.confirm_button"
              className="font-body text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Station
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
