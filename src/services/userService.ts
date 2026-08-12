import api from './api';

// PharmaLink.API/DTOs/Users/UserResponseDto.cs
export interface UserResponse {
    id: number;
    email: string;
    userName: string;
    role: string;
    profileImagePath?: string;
}

// PharmaLink.API/DTOs/Auth/UserRegisterDto.cs
export interface CreateUserRequest {
    userName: string;
    password: string;
    role: string; // 'Admin' or 'Pharmacist'
}

export interface UpdateUserRequest {
    userName: string;
    email: string;
    password?: string; 
    role: string;
}

export interface UpdateProfileRequest {
    userName: string;
    email: string;
    password?: string; // Optional, only if changing
}

export const getAllUsers = async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/Auth/Users'); 
    return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    // We target the 'Users' controller directly, not 'Auth'
    await api.delete(`/Users/${id}`); 
};

// We use the Auth registration endpoint, but call it from inside the app
export const registerUser = async (data: CreateUserRequest): Promise<void> => {
    await api.post('/Auth/register', data);
};

export const updateUser = async (id: number, data: UpdateUserRequest): Promise<void> => {
    await api.put(`/Auth/Users/${id}`, data);
};

// Upload Profile Photo
export const uploadProfilePhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ imageUrl: string }>('/Users/upload-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.imageUrl;
};

// Update Own Credentials (Self-Service)
export const updateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    await api.put('/Auth/update', data);
};

export interface UserProfile extends UserResponse {
    profileImagePath?: string; // Add this field
}

export const getUserById = async (id: number) => {
    return api.get(`/api/users/${id}`); 
};

export const getMyProfile = async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/Auth/me');
    return response.data;
};