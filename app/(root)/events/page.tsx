"use client";

import { useState } from "react";
import { Search, Sun, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function CollegeEvents() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Freshman Orientation",
      date: "2023-08-25",
      description: "Welcome event for new students",
      schedule: "9:00 AM - 4:00 PM",
    },
    {
      id: 2,
      title: "Alumni Homecoming",
      date: "2023-10-15",
      description: "Annual gathering for alumni",
      schedule: "11:00 AM - 8:00 PM",
    },
    {
      id: 3,
      title: "Career Fair",
      date: "2023-09-20",
      description: "Connect with potential employers",
      schedule: "10:00 AM - 3:00 PM",
    },
  ]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    description: "",
    schedule: "",
  });
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setEvents([...events, { ...newEvent, id: events.length + 1 }]);
    setNewEvent({ title: "", date: "", description: "", schedule: "" });
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const handleShowDetails = (event: any) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="p-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Sun className="h-6 w-6 text-orange-500 mr-2" />
            <h1 className="text-2xl font-bold text-black">CollegePortal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search events..."
                className="pl-8 w-64 border border-gray-300 text-black bg-white"
              />
            </div>
            <Button size="icon" variant="ghost">
              <Sun className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">Upcoming Events</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-black">
                    Add New Event
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Fill in the details for the new event.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-black">
                      Event Title
                    </Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-black">
                      Event Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-black">
                      Event Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule" className="text-black">
                      Event Schedule
                    </Label>
                    <Input
                      id="schedule"
                      value={newEvent.schedule}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, schedule: e.target.value })
                      }
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Add Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-black">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-black"
                        onClick={() => handleShowDetails(event)}
                      >
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-black">
                          {selectedEvent?.title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                          <p className="text-sm mb-4 text-black">
                            <span className="font-semibold">Description:</span>{" "}
                            {selectedEvent?.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Schedule:</span>{" "}
                            {selectedEvent?.schedule}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Date:</span>{" "}
                            {new Date(selectedEvent?.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm mb-4 text-black">{event.description}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Schedule:</span>{" "}
                  {event.schedule}
                </p>
                <Button
                  onClick={() => handleDeleteEvent(event.id)}
                  variant="destructive"
                  className="mt-4 text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
