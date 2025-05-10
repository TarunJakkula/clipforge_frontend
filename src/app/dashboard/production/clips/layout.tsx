import NavigationBar from "./components/NavigationBar"

export const metadata = {
    title: 'Clips',
};

export default function layout({ children }: { children: React.ReactNode }) {
    return (<div className='flex flex-col flex-1 h-[calc(100vh-72px)] '>
        <NavigationBar />
        {children}
    </div>
    )
}
