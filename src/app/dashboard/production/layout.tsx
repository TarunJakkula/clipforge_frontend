import Sidebar from './components/SideBar'
import Modal from "./components/Modal"

export default function layout({ children }: { children: React.ReactNode }) {

    return (
        <div className='w-screen h-auto flex justify-center items-center relative'>
            <Modal />
            <Sidebar />
            {children}
        </div>
    )
}
