export type Neighborhood = 'Collegetown' | 'Fall Creek' | 'Downtown' | 'Varna' | 'Lansing';
export type LeaseTerm = '10-month' | '11-month' | '12-month' | 'Sublet';
export type HeatingType = 'Gas' | 'Electric Baseboard' | 'Steam' | 'Unknown';

export interface Listing {
    id: string;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
    rent: number;
    bedrooms: number;
    bathrooms: number;
    neighborhood: Neighborhood;
    lease_term: LeaseTerm;
    heating_type: HeatingType;
    nearest_tcat_route: string | null;
    elevation_warning: boolean;
    distance_from_campus_miles: number | null;
    is_official_listing: boolean;
    url: string | null;
    description: string | null;
    photos: string[];
    user_id: string | null;
    created_at: string;
    host?: Profile; // Joined data
}

export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    updated_at: string;
}

export interface Inquiry {
    id: string;
    listing_id: string;
    sender_id: string;
    message: string;
    created_at: string;
    listing?: Listing; // For joining data
    sender?: Profile; // For joining data
}

export interface CreateListingDTO extends Omit<Listing, 'id' | 'created_at' | 'user_id'> {
    // DTO for creating a listing
}
