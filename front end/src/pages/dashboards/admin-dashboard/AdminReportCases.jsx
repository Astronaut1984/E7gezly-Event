import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import useAdminResource from "@/hooks/useAdminResource";
import { UserContext } from "@/UserContext";
import { useState, useEffect } from "react";
import { useContext } from "react";

export default function AdminReportCases() {
  const [value, setValue] = useState("P");

  const { user, loading: userLoading } = useContext(UserContext);

  const {
    items: reports,
    loading,
    fetchItems: reloadReportCases,
  } = useAdminResource({
    getUrl: "http://localhost:8000/adminutils/getreports/",
    listKey: "reports",
  });

  async function modifyReportCase(report) {
    try {
      const res = await fetch(
        "http://localhost:8000/adminutils/resolvereport/",
        {
          method: "PUT",
          body: JSON.stringify(report),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Modify failed");
      }

      await reloadReportCases();
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    reloadReportCases();
  }, [reloadReportCases]);

  const filterReports =
    !loading && reports.filter((report) => report.status === value);

  return (
    <div className="flex flex-col justify-center items-center w-full px-32">
      <h1 className="text-[30px] select-none font-bold mb-5">Report Cases</h1>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-[180px] h-10">
          <SelectValue placeholder="pending" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="P">pending</SelectItem>
          <SelectItem value="R">resolved</SelectItem>
        </SelectContent>
      </Select>
      {!loading && filterReports.length === 0 && (
        <h1 className="text-lg mt-10 select-none">No Report Cases Found</h1>
      )}
      {!loading &&
        filterReports.map((report) => {
          return (
            <ReportCaseCard
              key={report["report_id"]}
              orgUsername={report["owner"]}
              attendeeUsername={report["attendee"]}
              status={report["status"]}
              reportContent={report["report_content"]}
              onUpdate={() => reloadReportCases()}
              onModify={() =>
                modifyReportCase({
                  administrator: user["username"],
                  report_id: report["report_id"],
                })
              }
              adminUsername={
                report["status"] === "R" && report["administrator"]
              }
            />
          );
        })}
      {loading && <Spinner className="mt-10" />}
    </div>
  );
}

function ReportCaseCard({
  orgUsername,
  attendeeUsername,
  adminUsername,
  reportContent,
  status,
  onModify,
  onUpdate,
}) {
  async function handleModify() {
    try {
      if (onModify) await onModify();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="bg-card w-full h-max-30 rounded-2xl p-5 my-5 shadow select-text caret-transparent">
      <div className="flex justify-start items-center gap-10 ">
        <h1 className="text-lg m-1">Reported Organizer: {orgUsername}</h1>
        <h1 className="text-lg m-1">Reported by: {attendeeUsername}</h1>
      </div>
      <div className="border-b-2 border-primary my-3 select-none"></div>
      <h1 className="text-lg">Report Content:</h1>
      <p className="text-md p-3">{reportContent}</p>
      <div className="w-full flex justify-between items-center mt-3">
        <h1>
          <span
            className={`w-3 h-3 rounded-full ${
              status == "P" ? "bg-red-500" : "bg-green-500"
            } inline-block mr-2 ml-1`}
          ></span>
          {status == "P" ? "Pending" : "Resolved"}
        </h1>
        {status == "P" && (
          <button
            type="button"
            className={
              "bg-primary-hover select-none rounded-2xl text-[16px] text-white flex justify-center items-center w-50 h-[50px] border-0 cursor-pointer font-semibold "
            }
            onClick={handleModify}
          >
            Resolve Report
          </button>
        )}
        {status == "R" && (
          <h1 className="text-md">Resolved by Admin: {adminUsername}</h1>
        )}
      </div>
    </div>
  );
}
