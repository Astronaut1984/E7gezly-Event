import { useState } from "react"
import { NavLink } from "react-router-dom"



export default function Event({title,img,priceRange,venue,time}){

    return <div className="flex flex-col items-center h-max bg-white w-100 rounded-3xl">
        <div className="w-90 h-50 bg-black mt-5 rounded-3xl bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: `url(https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.4DkGUbOui9t5OI62K9aCtwHaEK%3Fpid%3DApi&f=1&ipt=655d029f755b2fca664704ff9156c6bcc84151e9c756e56e1d33aa6ec75b45f0&ipo=images)`,
            }}>
        </div>
        <div className="flex justify-start w-full px-5 pt-2">
            <h1 className="text-2xl">{title.length > 30 ? title.substring(0, 30) + "..." : title}</h1>
        </div>
        <div className="w-full flex justify-start px-5 pt-2">
            <h1 className="text-l">{`${time.startDate} ${time.endDate ? `- ${time.endDate}` : ""} | ${time.time}`}</h1>
        </div>
        <div className="w-full flex justify-start px-5 pt-2">
            <h1 className="text-l">{venue}</h1>
        </div>
        <div className="w-full flex justify-start  px-5 pt-2">
            <i className ="mt-[7px] fa-solid fa-money-bill pt-px mr-2 text-blue-500"></i>
            <h1 className="text-xl">{`Price range: ${priceRange.currency} ${priceRange.minPrice} - ${priceRange.maxPrice}`}</h1>
        </div>
        <NavLink to="/Events" className="text-white bg-blue-500 rounded-lg px-20 py-3 hover:text-blue-700 font-semibold my-4">Book Now!</NavLink>    
    </div>
} 