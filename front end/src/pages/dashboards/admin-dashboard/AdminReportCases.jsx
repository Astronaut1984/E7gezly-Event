import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function AdminReportCases() {
  const [value, setValue] = useState("pending");

  return (
    <div className="flex flex-col justify-center items-center w-full px-32">
      <h1 className="text-[30px] font-bold">Report Cases</h1>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-[180px] h-10">
          <SelectValue placeholder="pending" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">pending</SelectItem>
          <SelectItem value="resolved">resolved</SelectItem>
        </SelectContent>
      </Select>
      <ReportCaseCard
        orgUsername="John"
        attendeeUsername="Doe"
        reportContent="Murder"
      />
    </div>
  );
}

function ReportCaseCard({ orgUsername, attendeeUsername, reportContent, status }) {
  return (
    <div className="bg-card w-full h-max-30 rounded-2xl p-5 my-5 shadow">
      <div className="flex justify-start items-center gap-10">
        <h1 className="text-lg m-1">Reported Organizer: {orgUsername}</h1>
        <h1 className="text-lg m-1">Reported by: {attendeeUsername}</h1>
      </div>
      <div className="border-b-2 border-primary my-3"></div>
      <h1 className="text-lg">Report Content:</h1>
      <p className="text-md p-3">
        {reportContent} Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Sed nihil neque, quibusdam sit eos provident temporibus consectetur
        nobis, modi eum deleniti eius placeat ipsa expedita doloremque
        perspiciatis aliquam maiores sapiente?
      </p>
      <div className="w-full flex justify-between items-center">
        <h1><span className="h-1  rounded-full bg-red-500 p-1 mr-1"></span>Pending</h1>
        <button
          type="button"
          className={
            "bg-primary-hover rounded-2xl text-[16px] text-white flex justify-center items-center w-50 h-[50px] border-0 cursor-pointer font-semibold "
          }
        >
          Resolve Report
        </button>
      </div>
    </div>
  );
}
