import { Routes, NavLink,useLocation } from 'react-router-dom';

export default function NavBar(){
    const HOVER_COLOR = "hover:text-blue-950";
    const location = useLocation();

    return (
        <div className="z-10 fixed w-full bg-gray-50 text-blue-600 items-center flex justify-between p-1">
             <div className='ml-5'>
                <h1 className='text-2xl font-bold'>E7gezly Event</h1>
            </div>
            <nav className="mx-auto max-w-5xl flex items-center gap-6 py-4">
                <NavLink to="/" className={({isActive}) => isActive ? "bg-blue-500 px-4 pb-px rounded-md text-white" : HOVER_COLOR}>Home</NavLink>
                <NavLink to="/Events" className={({isActive}) => isActive ? "bg-blue-500 px-4 pb-px rounded-md text-white" : HOVER_COLOR}>Events</NavLink>
            </nav>
            <nav className="mx-5 max-w-5xl flex items-center gap-6 py-4">
                <NavLink to="/login" className={({isActive}) => isActive ? "bg-blue-500 px-4 pb-px rounded-md text-white" : HOVER_COLOR}>Login</NavLink>
                <NavLink to="/signup" className={({isActive}) => isActive ? "bg-blue-500 px-4 pb-px rounded-md text-white" : HOVER_COLOR}>Sign up</NavLink>
            </nav>
        </div>
    )
}