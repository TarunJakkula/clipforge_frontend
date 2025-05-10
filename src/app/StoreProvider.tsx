'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../lib/store'
import { PersistGate } from "redux-persist/integration/react";
import { Persistor, persistStore } from "redux-persist";
import Image from 'next/image';
import loadingIndicator from "../../public/motion-blur-2.svg";
import { createContext, useContext } from "react";

const PersistorContext = createContext<any>(null);

export const usePersistor = () => useContext(PersistorContext);


export default function StoreProvider({ children }: {
    children: React.ReactNode
}) {
    const storeRef = useRef<AppStore>()
    const presistorRef = useRef<Persistor>();
    if (!storeRef.current) {
        storeRef.current = makeStore()
        presistorRef.current = persistStore(storeRef.current);
    }
    return (
        <Provider store={storeRef.current}>
            <PersistorContext.Provider value={presistorRef.current}>
                <PersistGate loading={
                    <div className='w-screen h-screen grid place-content-center bg-black'>
                        <Image src={loadingIndicator} alt="Loading..." priority />
                    </div>
                } persistor={presistorRef.current!}>
                    {children}
                </PersistGate>
            </PersistorContext.Provider>
        </Provider>
    );
}