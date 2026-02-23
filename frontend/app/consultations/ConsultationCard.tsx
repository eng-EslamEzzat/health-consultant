"use client";

import { useState, useEffect, useCallback } from "react";
import { Consultation, generateAiSummary, fetchConsultation } from "@/app/lib/api";

export default function ConsultationCard({ initialConsultation }: { initialConsultation: Consultation }) {
    const [consultation, setConsultation] = useState(initialConsultation);
    const [generating, setGenerating] = useState(false);
    const [polling, setPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = useCallback(async () => {
        try {
            const updated = await fetchConsultation(consultation.id);
            if (updated.ai_summary) {
                setConsultation(updated);
                setPolling(false);
            }
        } catch (err) {
            console.error("Error polling for summary:", err);
        }
    }, [consultation.id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (polling) {
            interval = setInterval(checkStatus, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [polling, checkStatus]);

    async function handleGenerate(e: React.MouseEvent) {
        e.preventDefault();
        setGenerating(true);
        setError(null);
        try {
            await generateAiSummary(consultation.id);
            setPolling(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate summary");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 ring-1 ring-slate-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {new Date(consultation.created_at).toLocaleDateString()}
                    </span>
                    {consultation.ai_summary ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            AI Summary
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
                            Pending AI
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 truncate mb-4">
                    {consultation.patient.full_name}
                </h3>

                <div className="space-y-4 flex-grow">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Symptoms</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{consultation.symptoms}</p>
                    </div>
                    {consultation.diagnosis && (
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Diagnosis</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{consultation.diagnosis}</p>
                        </div>
                    )}

                    {consultation.ai_summary && (
                        <div className="mt-4 pt-4 border-t border-slate-100 bg-indigo-50/50 -mx-6 px-6 pb-4 rounded-b-xl flex-grow">
                            <div className="flex items-center gap-2 mb-2 pt-2">
                                <svg className="h-4 w-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">AI Summary</p>
                            </div>
                            <div className="text-sm text-slate-800 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: consultation.ai_summary.replace(/\n/g, '<br/>') }} />
                        </div>
                    )}
                    {error && (
                        <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">{error}</p>
                    )}
                </div>
            </div>

            {!consultation.ai_summary && (
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 mt-auto">
                    <button
                        onClick={handleGenerate}
                        disabled={generating || polling}
                        className="w-full flex justify-center items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors gap-2"
                    >
                        {generating || polling ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {generating ? "Generating..." : "Processing AI..."}
                            </>
                        ) : "Generate AI Summary"}
                    </button>
                </div>
            )}
        </div>
    );
}
