"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, MapPin, Clock } from "lucide-react";

// Sample exchange rate: 1 USD = 82 INR
const USD_TO_INR = 82;

const jobListings = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Bhilwara",
    type: "Full-time",
    salary: "$80,000 - $120,000",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "CSS"],
  },
  {
    id: 2,
    title: "Data Scientist",
    company: "DataWiz",
    location: "Hydrabad",
    type: "Full-time",
    salary: "$100,000 - $150,000",
    posted: "1 week ago",
    tags: ["Python", "Machine Learning", "SQL"],
  },
  {
    id: 3,
    title: "UX Designer",
    company: "DesignMasters",
    location: "Mumbai",
    type: "Contract",
    salary: "$70 - $100 per hour",
    posted: "3 days ago",
    tags: ["Figma", "User Research", "Prototyping"],
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudSolutions",
    location: "Ahmedabad",
    type: "Full-time",
    salary: "$90,000 - $130,000",
    posted: "Just now",
    tags: ["AWS", "Docker", "Kubernetes"],
  },
  {
    id: 5,
    title: "Mobile App Developer",
    company: "AppInnovate",
    location: "Indore",
    type: "Full-time",
    salary: "$75,000 - $110,000",
    posted: "5 days ago",
    tags: ["React Native", "iOS", "Android"],
  },
];

// Function to convert salary range from USD to INR
function convertSalaryToINR(salaryRange) {
  const salaryParts = salaryRange.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
  if (!salaryParts) return salaryRange;

  const minSalaryUSD = parseInt(salaryParts[1].replace(/,/g, ""));
  const maxSalaryUSD = parseInt(salaryParts[2].replace(/,/g, ""));

  const minSalaryINR = (minSalaryUSD * USD_TO_INR).toLocaleString("en-IN");
  const maxSalaryINR = (maxSalaryUSD * USD_TO_INR).toLocaleString("en-IN");

  return `₹${minSalaryINR} - ₹${maxSalaryINR}`;
}

export default function JobPortalComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState("All");

  const filteredJobs = jobListings.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (jobType === "All" || job.type === jobType)
  );

  return (
    <div className="p-8 bg-white shadow-md rounded-xl max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Job Portal</h2>
        <Button className="bg-orange-500 text-white px-5 py-2 rounded-full">
          Post a Job
        </Button>
      </div>

      {/* Search Bar and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search for jobs..."
            className="pl-12 pr-4 py-3 text-lg border rounded-full focus:ring focus:ring-orange-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3 text-gray-400" size={24} />
        </div>
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger className="w-full md:w-48 border h-12">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {job.title}
                </h3>
                <p className="text-sm text-orange-600">{job.company}</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700">
                {job.type}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Briefcase size={16} className="mr-1" />
                {convertSalaryToINR(job.salary)}
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                {job.posted}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map((tag, index) => (
                <Badge
                  key={index}
                  className="border border-gray-300 text-gray-600"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <Button className="w-full bg-orange-500 text-white py-2 rounded-full">
              Apply Now
            </Button>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredJobs.length === 0 && (
        <div className="text-center text-gray-600 mt-8">
          No jobs found matching your criteria.
        </div>
      )}

      {/* Load More Button */}
      <div className="mt-8 text-center">
        <Button className="border border-orange-500 text-orange-500 py-2 px-4 rounded-full hover:bg-orange-100">
          Load More Jobs
        </Button>
      </div>
    </div>
  );
}
