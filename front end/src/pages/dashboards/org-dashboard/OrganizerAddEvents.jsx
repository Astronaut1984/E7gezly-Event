import Input from "@/components/Input";
import SelectOnly from "@/components/SelectOnly";
import {useState} from 'react';
  const optionsCategory = ["Concert","Comedy","Art & Theatre","Disco","Week Trip"];
  const optionsLocation = ["Mall of Egypt","Arabia Mall","Tiba Mall","Marasi","Cairo University"];
const getMinDateTime = () => {
    const now = new Date();
    const isoString = now.toISOString();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    return isoString.substring(0, 16); 
};

export default function OrganizerAddEvents(){
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    category: "",
    start_date: "",
    end_date: "",
    location: "",
    banner: "",
  });

  const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    }; 

  const minDate = getMinDateTime();
    return (
        <> 
            <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
                <h1>Add Event</h1>
                <div className="flex flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3">
                    <div className="flex justify-between w-full gap-30">
                        <Input
                            title="Event Name"
                            type="text"
                            name="eventName"
                            placeholder="Amr Diab concert"
                            value={formData.eventName}
                            onChange={handleChange}
                        />
                        <SelectOnly
                            title="Category"
                            options={optionsCategory}
                            placeholder="Select category"
                            value={formData.category}
                            onSelect={(option) => setFormData({ ...formData, accountType: option })}
                        />
                    </div>
                    <Input
                        title="Description"
                        type="text"
                        name="description"
                        placeholder="Amr diab concert (to be hold in el ein el sokhna from 20:00 31/12/2025 to 1:00 1/1/2026"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <div className="flex justify-between w-full gap-30">
                        <Input
                            title="Start Date"
                            type="datetime-local"
                            name="start_date" 
                            min={minDate}
                            value={formData.start_date}
                            onChange={handleChange}
                            selectOnly={true}
                        />
                        <Input
                            title="End Date"
                            type="datetime-local"
                            name="end_date" 
                            min={formData.start_date} 
                            value={formData.end_date}
                            onChange={handleChange}
                            selectOnly={true}
                        />
                    </div>
                    <SelectOnly
                        title="Venue"
                        options={optionsLocation}
                        placeholder="Select location"
                        value={formData.location}
                        onSelect={(option) => setFormData({ ...formData, accountType: option })}
                    />
                </div>
            </div>
        </>
    );
}