"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const mentors = [
  {
    id: 1,
    name: "Subhjeet Bhatacharya",
    expertise: "Web Development",
    tags: ["JavaScript", "React", "Node.js"],
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 2,
    name: "Rimjhim Nahta",
    expertise: "Project Management",
    tags: ["Agile", "Scrum", "Kanban"],
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1682089897177-4dbc85aa672f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW5kaWFuJTIwY29sbGVnZSUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 3,
    name: "D Suresh",
    expertise: "UI/UX Design",
    tags: ["Figma", "Adobe XD", "Sketch"],
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHByb2ZpbGUlMjBwaWN0dXJlfGVufDB8fDB8fHww",
  },
  {
    id: 4,
    name: "Roger Binni",
    expertise: "Mobile Development",
    tags: ["React Native", "Flutter", "Swift"],
    imageUrl:
      "https://images.unsplash.com/photo-1717533564570-4ea91a5df160?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fHBhc3Nwb3J0c2l6ZSUyMHBob3RvfGVufDB8fDB8fHww",
  },
  {
    id: 5,
    name: "Jitendra Singh",
    expertise: "Cybersecurity",
    tags: ["Network Security", "Ethical Hacking", "Cryptography"],
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1682089877310-b2308b0dc719?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGluZGlhbiUyMGNvbGxlZ2UlMjBib3l8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 6,
    name: "Suresh Kumar Chand",
    expertise: "Cloud Computing",
    tags: ["AWS", "Azure", "Google Cloud"],
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1682089892133-556bde898f2c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW5kaWFuJTIwYm95fGVufDB8fDB8fHww",
  },
  {
    id: 7,
    name: "Shreya Kumari",
    expertise: "Project Management",
    tags: ["Agile", "Scrum", "Kanban"],
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1664910500054-608d23c060f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGluZGlhbiUyMGNvbGxlZ2UlMjBnaXJsfGVufDB8fDB8fHww",
  },
];

export default function EnhancedMentorshipComponent() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter mentors based on search query
  const filteredMentors = mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Find Your Mentor</h2>
        <div className="relative w-full md:w-9/12">
          <Input
            type="text"
            placeholder="Search mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update the search query
            className="pl-12 pr-4 py-4 md:py-6 text-lg rounded-full border-orange-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 w-full "
          />
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={24}
          />
        </div>
      </div>

      {/* Display filtered mentors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <Image
                  src={mentor.imageUrl}
                  alt={mentor.name}
                  width={150}
                  height={150}
                  className="rounded-full border-4 border-orange-200"
                />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">
                {mentor.name}
              </h3>
              <p className="text-sm text-center text-orange-600 font-medium mb-3">
                {mentor.expertise}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {mentor.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-300">
                Connect
              </Button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No mentors found</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105">
          Request Mentorship
        </Button>
        <Button
          variant="outline"
          className="w-full md:w-auto border-orange-500 text-orange-500 hover:bg-orange-100 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          View All Mentors
        </Button>
      </div>
    </div>
  );
}
