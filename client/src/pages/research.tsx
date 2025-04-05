import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertResearchNoteSchema } from "@shared/schema";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extend schema with additional validation
const researchNoteFormSchema = insertResearchNoteSchema.extend({
  date: z.coerce.date(),
  tags: z.string().transform(value => value.split(',').map(tag => tag.trim())),
});

// Categories for research notes
const categories = [
  { id: "feed", name: "Feed" },
  { id: "genetics", name: "Genetics" },
  { id: "environment", name: "Environment" },
  { id: "health", name: "Health" },
  { id: "production", name: "Production" },
  { id: "equipment", name: "Equipment" },
  { id: "other", name: "Other" }
];

const Research = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedNote, setExpandedNote] = useState<number | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof researchNoteFormSchema>>({
    resolver: zodResolver(researchNoteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      date: new Date(),
      tags: "",
      category: "",
    },
  });
  
  const { data: researchNotes, isLoading } = useQuery({
    queryKey: ['/api/notes', { category: activeTab !== "all" ? activeTab : undefined }],
  });
  
  const createNoteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof researchNoteFormSchema>) => {
      const res = await apiRequest('POST', '/api/notes', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Note created",
        description: "Research note has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create research note.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof researchNoteFormSchema>) => {
    createNoteMutation.mutate(data);
  };
  
  const toggleNoteExpansion = (id: number) => {
    setExpandedNote(expandedNote === id ? null : id);
  };
  
  const getCategoryBadgeClasses = (category: string) => {
    switch (category.toLowerCase()) {
      case 'feed':
        return 'bg-amber-100 text-amber-700';
      case 'genetics':
        return 'bg-purple-100 text-purple-700';
      case 'environment':
        return 'bg-blue-100 text-blue-700';
      case 'health':
        return 'bg-red-100 text-red-700';
      case 'production':
        return 'bg-green-100 text-green-700';
      case 'equipment':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Research Notes</h2>
          <p className="text-neutral-600">Document and track research findings and observations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <i className="ri-add-line mr-1"></i>
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Research Note</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Feed Optimization Experiment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tags separated by commas" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Example: feed, nutrition, calcium
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed research findings, observations, and conclusions"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createNoteMutation.isPending}>
                    {createNoteMutation.isPending ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Research Notes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Research Notes</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("all")}
              >
                All
              </Button>
              {categories.map(category => (
                <Button 
                  key={category.id}
                  variant={activeTab === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p>Loading research notes...</p>
            </div>
          ) : researchNotes && researchNotes.length > 0 ? (
            <div className="space-y-6">
              {researchNotes.map((note: any) => (
                <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800">{note.title}</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        {format(new Date(note.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2 py-1 rounded bg-primary-100 text-primary-700`}>
                        Research
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeClasses(note.category)}`}>
                        {note.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className={`text-sm text-neutral-700 ${
                      expandedNote === note.id ? '' : 'line-clamp-3'
                    }`}>
                      {note.content}
                    </p>
                    {note.content.length > 200 && (
                      <button 
                        onClick={() => toggleNoteExpansion(note.id)}
                        className="text-xs text-primary-600 hover:text-primary-700 mt-2 font-medium"
                      >
                        {expandedNote === note.id ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {note.tags.map((tag: string, index: number) => (
                        <span 
                          key={index} 
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <i className="ri-file-text-line text-4xl text-neutral-300 mb-2"></i>
              <p className="text-neutral-500">No research notes found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                Create First Note
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Research;
