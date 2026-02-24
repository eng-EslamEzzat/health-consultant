// Server-side (SSR): route through Nginx inside Docker network
// Client-side (browser): relative path, served by Nginx on the same origin
const API_URL = typeof window === 'undefined'
    ? (process.env.INTERNAL_API_URL || 'http://localhost:8000/api')
    : '/api';

export interface Patient {
    id: number;
    full_name: string;
    date_of_birth: string;
    email: string;
}

export interface Consultation {
    id: number;
    patient: number;
    patient_name: string;
    symptoms: string;
    diagnosis: string;
    created_at: string;
    ai_summary: string | null;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export async function fetchPatients(page: number = 1): Promise<PaginatedResponse<Patient>> {
    const res = await fetch(`${API_URL}/patients/?page=${page}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
}

export async function createPatient(data: Omit<Patient, 'id'>): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create patient');
    return res.json();
}

export async function fetchConsultations(page: number = 1, patientId?: string | number): Promise<PaginatedResponse<Consultation>> {
    let url = `${API_URL}/consultations/?page_size=9&page=${page}`;
    if (patientId) {
        url += `&patient=${patientId}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch consultations');
    return res.json();
}

export async function fetchConsultation(id: string | number): Promise<Consultation> {
    const res = await fetch(`${API_URL}/consultations/${id}/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch consultation');
    return res.json();
}

export async function createConsultation(data: { patient: number; symptoms: string; diagnosis?: string }): Promise<Consultation> {
    const res = await fetch(`${API_URL}/consultations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            patient: data.patient,
            symptoms: data.symptoms,
            diagnosis: data.diagnosis || "",
        }),
    });
    if (!res.ok) throw new Error('Failed to create consultation');
    return res.json();
}

export async function generateAiSummary(id: string | number): Promise<Consultation> {
    const res = await fetch(`${API_URL}/consultations/${id}/generate-summary/`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate AI summary');
    return res.json();
}
