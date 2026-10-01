import api from './api';
import axios from 'axios';

export interface PaginationMeta {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
}

// send to the API (Matches CreateSaleRequestDto.cs)
export interface SaleItemDto {
    medicineId: number;
    quantity: number;
}

export interface SaleItemResponse {
    id: number;
    medicineId: number;
    medicineName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    nameIsSnapshot?: boolean;
}

export interface SaleAdjustment {
    id: number;
    saleId: number;
    revision: number;
    actorId: number;
    clientRequestId: string;
    kind: 'Correction' | 'Void';
    reason: string;
    recordedAt: string;
    beforeTotal: number;
    afterTotal: number;
    beforeItems: SaleItemResponse[];
    afterItems: SaleItemResponse[];
}
export interface SaleAdjustmentRequest {
    clientRequestId: string;
    kind: 'Correction' | 'Void';
    reason: string;
    expectedRevision: number;
    items: SaleItemDto[];
}

export interface CreateSaleRequest {
    Items: SaleItemDto[];
    ClientRequestId: string;
}

// What the API returns (Matches SaleResponseDto.cs)
export interface SaleResponse {
    id: number;
    userId: number;
    totalAmount: number;
    transactionDate: string;
    items: SaleItemResponse[];
    status?: 'Recorded' | 'Corrected' | 'Voided';
    revision?: number;
    effectiveTotal?: number;
    effectiveItems?: SaleItemResponse[];
    adjustments?: SaleAdjustment[];
}

export interface SalesParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    orderBy?: string;
    startDate?: string; // ISO Date String (YYYY-MM-DD)
    endDate?: string;   // ISO Date String (YYYY-MM-DD)
}

export interface SaleApiResponse {
    meta: PaginationMeta;
    data: SaleResponse[];
}

export interface CreateSaleResponse {
    message: string;
    saleId: number;
}

export const createSale = async (data: CreateSaleRequest): Promise<CreateSaleResponse> => {
    const response = await api.post<CreateSaleResponse>('/Sales', data);
    return response.data;
};

export const getSaleById = async (id: number): Promise<SaleResponse> => {
    const response = await api.get<SaleResponse>(`/Sales/${id}`);
    return response.data;
};

export const getSales = async (params: SalesParams): Promise<SaleApiResponse> => {
    const response = await api.get<SaleApiResponse>('/Sales', { params });
    return response.data;
};

export const adjustSale = async (id: number, request: SaleAdjustmentRequest): Promise<SaleAdjustment> => {
    const response = await api.post<SaleAdjustment>(`/Sales/${id}/adjustments`, request);
    return response.data;
};
export const findSaleAdjustment = async (id: number, key: string): Promise<SaleAdjustment | null> => {
    try {
        const response = await api.get<SaleAdjustment>(`/Sales/${id}/adjustments/requests/${key}`);
        return response.data;
    } catch (error) {
        // A missing request is not proof an in-flight original has stopped.
        if (axios.isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
    }
};
