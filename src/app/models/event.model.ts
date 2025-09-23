export interface Registration {
    uuid: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface Event {
    id: number;
    uuid: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    available_slots: number;
    registrations: Registration[];
}
