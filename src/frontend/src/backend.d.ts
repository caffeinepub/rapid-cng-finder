import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CNGStation {
    id: bigint;
    status: StationStatus;
    city: string;
    name: string;
    pricePerKg: number;
    isActive: boolean;
    address: string;
    phone: string;
    operatingHours: string;
}
export interface UserProfile {
    name: string;
}
export enum StationStatus {
    closed = "closed",
    open = "open"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStation(name: string, address: string, city: string, operatingHours: string, pricePerKg: number, status: StationStatus, phone: string, isActive: boolean): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteStation(id: bigint): Promise<void>;
    getAllCitiesGrouped(): Promise<{
        nh19: Array<[string, string]>;
        nh44: Array<[string, string]>;
        nh48: Array<[string, string]>;
        pakistan: Array<[string, string]>;
        other_india: Array<[string, string]>;
        nh33_20: Array<[string, string]>;
    }>;
    getAllStations(): Promise<Array<CNGStation>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getStation(id: bigint): Promise<CNGStation>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    preloadSampleData(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchByCity(city: string): Promise<Array<CNGStation>>;
    searchByPriceRange(minPrice: number, maxPrice: number): Promise<Array<CNGStation>>;
    updateStation(id: bigint, name: string, address: string, city: string, operatingHours: string, pricePerKg: number, status: StationStatus, phone: string, isActive: boolean): Promise<void>;
}
