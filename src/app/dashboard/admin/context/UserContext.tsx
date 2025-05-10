"use client"

import axiosInstance from '@/util/axiosInstance';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

type User = {
    user_id: string;
    email: string;
    access: string;
}

interface UsersContextValue {
    users: User[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextValue | undefined>(undefined);

export const useUsers = (): UsersContextValue => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error("useUsers must be used within a UsersProvider");
    }
    return context;
};

interface UsersProviderProps {
    children: ReactNode;
}

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);


    const fetchUsers = async () => {
        try {
            const { data } = await axiosInstance.get("/admin/fetch_users");
            setUsers(data.data);
            console.log(data.data)
            setLoading(false);
        } catch (e) {
            setError("Error fetching users");
            toast.error("Error fetching users");
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [])


    return (
        <UsersContext.Provider value={{ users, fetchUsers, loading, error }}>
            {children}
        </UsersContext.Provider>
    );
};
