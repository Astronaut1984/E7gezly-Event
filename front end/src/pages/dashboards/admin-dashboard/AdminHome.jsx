import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";

export default function AdminHome() {
  const [venueReport, setVenueReport] = useState(null);
  const [topOrg, setTopOrg] = useState(null);
  const [topCat, setTopCat] = useState(null);
  const [loading, setLoading] = useState(true);

  async function getVenueReport() {
    setLoading(true);
    const request = await fetch(
      "http://localhost:8000/Record/venueusagereport/"
    );
    const data = await request.json();
    setVenueReport(data["data"]);
    setLoading(false);
  }

  async function getTopOrg() {
    setLoading(true);
    const request = await fetch("http://localhost:8000/Record/orgleaderboard/");
    const data = await request.json();
    setTopOrg(data["data"]);
    setLoading(false);
  }

  async function getCategoryData() {
    setLoading(true);
    const request = await fetch("http://localhost:8000/Record/categorydata/");
    const data = await request.json();
    setTopCat(data["data"]);
    setLoading(false);
  }

  useEffect(() => {
    getVenueReport();
    getTopOrg();
    getCategoryData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center flex-col mt-10">
        <Leaderboard
          title="Top Venues"
          data={venueReport}
          config={{
            mainField: "venue_name",
            subField: "city",
            stats: [
              { key: "events_hosted", label: "Events" },
              { key: "tickets_sold", label: "Tickets" },
              {
                key: "revenue",
                label: "Revenue",
                format: (val) => (
                  <>
                    <div className="text-sm">EGP</div>
                    <div>{(val / 1000).toFixed(2)}K</div>
                  </>
                ),
              },
            ],
          }}
        />
      </div>
      <div className="flex items-center flex-col mt-10">
        <Leaderboard
          title="Top Organizers"
          data={topOrg}
          config={{
            mainField: "organizer",
            stats: [
              { key: "events", label: "Events" },
              { key: "followers", label: "Followers" },
              {
                key: "total_revenue",
                label: "Revenue",
                format: (val) => (
                  <>
                    <div className="text-sm">EGP</div>
                    <div>{(val / 1000).toFixed(2)}K</div>
                  </>
                ),
              },
            ],
          }}
        />
      </div>
      <div className="flex items-center flex-col mt-10">
        <Leaderboard
          title="Top Categories"
          data={topCat}
          config={{
            mainField: "category_name",
            stats: [
              { key: "total_events", label: "Events" },
              { key: "total_tickets_sold", label: "Tickets" },
              {
                key: "average_ticket_price",
                label: "Avg Price",
                format: (val) => (
                  <>
                    <div className="text-sm">EGP</div>
                    <div>{(val / 1000).toFixed(2)}K</div>
                  </>
                ),
              },
              {
                key: "total_revenue",
                label: "Revenue",
                format: (val) => (
                  <>
                    <div className="text-sm">EGP</div>
                    <div>{(val / 1000).toFixed(2)}K</div>
                  </>
                ),
              },
            ],
          }}
        />
      </div>
    </>
  );
}

function Leaderboard({ title, data, config }) {
  const getRankBadgeStyle = (rank) => {
    switch (rank) {
      case 0:
        return "bg-yellow-600"; // Gold
      case 1:
        return "bg-slate-500"; // Silver
      case 2:
        return "bg-amber-600"; // Bronze
      default:
        return "bg-primary";
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="w-full flex justify-center flex-wrap items-center gap-6 py-5">
        {data &&
          data.map((item, index) => {
            return (
              <div
                key={index}
                className="flex relative w-80 min-h-[250px] p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {/* Rank Badge */}
                <div
                  className={`absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${getRankBadgeStyle(
                    index
                  )}`}
                >
                  #{index + 1}
                </div>

                <div className="flex flex-col gap-3 mt-2 flex-1">
                  {/* Main Title and Subtitle */}
                  <div>
                    <h2 className="text-xl font-bold text-card-foreground">
                      {item[config.mainField]}
                    </h2>
                    {config.subField && (
                      <p className="text-sm text-muted-foreground">
                        {item[config.subField]}
                      </p>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="flex flex-wrap gap-2 justify-center items-center h-full">
                    {config.stats.map((stat, statIndex) => {
                      const value = item[stat.key];
                      const displayValue = stat.format
                        ? stat.format(value)
                        : value > 0
                        ? value
                        : "0";

                      return (
                        <div
                          key={statIndex}
                          className="flex flex-col items-center p-3 min-w-[70px] bg-card shadow rounded-lg"
                        >
                          <span
                            className={`${
                              statIndex === config.stats.length - 1
                                ? "text-xl"
                                : "text-2xl"
                            } font-bold ${
                              statIndex === config.stats.length - 1
                                ? "text-secondary"
                                : "text-primary"
                            }`}
                          >
                            {displayValue}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {stat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
