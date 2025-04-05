import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ResearchNote } from "@shared/schema";
import { format } from "date-fns";

const NoteItem = ({ note }: { note: ResearchNote }) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d');
  };
  
  const getCategoryBadgeClasses = (category: string) => {
    switch (category.toLowerCase()) {
      case 'feed':
        return 'bg-amber-100 text-amber-700';
      case 'environment':
        return 'bg-blue-100 text-blue-700';
      case 'genetics':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  };
  
  return (
    <div className="p-3 border border-neutral-100 rounded-md hover:bg-neutral-50">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-neutral-800">{note.title}</h4>
        <span className="text-xs text-neutral-500">{formatDate(note.date)}</span>
      </div>
      <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{note.content}</p>
      <div className="flex mt-2">
        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded">Research</span>
        <span className={`text-xs px-2 py-0.5 rounded ml-2 ${getCategoryBadgeClasses(note.category)}`}>
          {note.category}
        </span>
      </div>
    </div>
  );
};

const RecentNotes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/notes'],
    select: (data) => data.slice(0, 3), // Get only the 3 most recent notes
  });
  
  return (
    <Card className="p-6 border border-neutral-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-neutral-800">Recent Research Notes</h3>
        <Link href="/research">
          <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 p-0 h-auto">
            <i className="ri-add-line mr-1"></i> New Note
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 border border-neutral-100 rounded-md">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-11/12"></div>
                </div>
                <div className="flex mt-2 space-x-2">
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </>
        ) : data && data.length > 0 ? (
          data.map((note: ResearchNote) => (
            <NoteItem key={note.id} note={note} />
          ))
        ) : (
          <div className="text-center p-6">
            <i className="ri-file-text-line text-neutral-300 text-3xl mb-2"></i>
            <p className="text-neutral-500 text-sm">No research notes available</p>
          </div>
        )}
      </div>
      
      <Link href="/research">
        <Button variant="link" className="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all research notes
        </Button>
      </Link>
    </Card>
  );
};

export default RecentNotes;
