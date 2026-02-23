// Server-side (SSR) uses the internal Docker URL to reach the backend container
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:8000/api';
// Client-side (browser) uses the public URL baked in at build time
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getApiUrl(): string {
    return typeof window === 'undefined' ? INTERNAL_API_URL : PUBLIC_API_URL;
}

export interface Patient {
    id: number;
    full_name: string;
    date_of_birth: string;
    email: string;
}

export interface Consultation {
    id: number;
    patient: Patient;
    symptoms: string;
    diagnosis: string;
    created_at: string;
    ai_summary: string | null;
}

export async function fetchPatients(): Promise<Patient[]> {
    const res = await fetch(`${getApiUrl()}/patients/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
}

export async function createPatient(data: Omit<Patient, 'id'>): Promise<Patient> {
    const res = await fetch(`${getApiUrl()}/patients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create patient');
    return res.json();
}

export async function fetchConsultations(): Promise<Consultation[]> {
    const res = await fetch(`${getApiUrl()}/consultations/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch consultations');
    return res.json();
}

export async function fetchConsultation(id: string | number): Promise<Consultation> {
    const res = await fetch(`${getApiUrl()}/consultations/${id}/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch consultation');
    return res.json();
}

export async function createConsultation(data: { patient: number; symptoms: string; diagnosis?: string }): Promise<Consultation> {
    const res = await fetch(`${getApiUrl()}/consultations/`, {
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

export async function generateAiSummary(id: string | number): Promise<{ detail: string }> {
    const res = await fetch(`${getApiUrl()}/consultations/${id}/generate-summary/`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate AI summary');
    return res.json();
}
