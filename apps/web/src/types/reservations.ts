export interface Reservation {
    id: string;
    date: string;
    time: string;
    name: string;
    party_size: number;
    phone_number: string;
    chef_override: boolean;
    comment?: string | null;
    status: string;
}