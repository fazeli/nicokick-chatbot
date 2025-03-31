import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  id: number;
  topic: string;
  question: string;
  answer: string;
  keywords: string[];
  embedding?: number[];
}

export default function AdminFaq() {
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [formState, setFormState] = useState<Partial<FAQ>>({
    topic: "",
    question: "",
    answer: "",
    keywords: [] as string[]
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all FAQs
  const { data: faqs = [] as FAQ[], isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/faqs'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    queryFn: async () => {
      const response: any = await apiRequest('/api/admin/faqs');
      return response as FAQ[];
    }
  });
  
  // Create FAQ mutation
  const createFaq = useMutation({
    mutationFn: (faq: Omit<FAQ, 'id'>) => apiRequest('/api/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(faq),
      headers: { 'Content-Type': 'application/json' }
    } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faqs'] });
      toast({
        title: "FAQ Created",
        description: "The FAQ has been created successfully."
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Update FAQ mutation
  const updateFaq = useMutation({
    mutationFn: (faq: FAQ) => apiRequest(`/api/admin/faqs/${faq.id}`, {
      method: 'PUT',
      body: JSON.stringify(faq),
      headers: { 'Content-Type': 'application/json' }
    } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faqs'] });
      toast({
        title: "FAQ Updated",
        description: "The FAQ has been updated successfully."
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete FAQ mutation
  const deleteFaq = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/faqs/${id}`, {
      method: 'DELETE'
    } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faqs'] });
      toast({
        title: "FAQ Deleted",
        description: "The FAQ has been deleted successfully."
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Extract unique topics from FAQs
  useEffect(() => {
    if (faqs && faqs.length > 0) {
      const uniqueTopics = Array.from(new Set(faqs.map(faq => faq.topic)));
      setTopics(uniqueTopics);
      
      if (!selectedTopic && uniqueTopics.length > 0) {
        setSelectedTopic(uniqueTopics[0]);
      }
    }
  }, [faqs, selectedTopic]);
  
  // Filter FAQs by selected topic
  const getFaqsByTopic = (topicName: string) => {
    if (!faqs) return [];
    return faqs.filter((faq: FAQ) => faq.topic === topicName);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  // Add keyword to the form
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formState.keywords?.includes(newKeyword.trim())) {
      setFormState(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };
  
  // Remove keyword from the form
  const handleRemoveKeyword = (keyword: string) => {
    setFormState(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };
  
  // Reset form to default state
  const resetForm = () => {
    setFormState({
      topic: "",
      question: "",
      answer: "",
      keywords: []
    });
    setNewKeyword("");
  };
  
  // Open add dialog
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  // Open edit dialog with selected FAQ data
  const openEditDialog = (faq: FAQ) => {
    setSelectedFaq(faq);
    setFormState({
      topic: faq.topic,
      question: faq.question,
      answer: faq.answer,
      keywords: [...faq.keywords]
    });
    setIsEditDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle form submission for adding a new FAQ
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.topic || !formState.question || !formState.answer || !formState.keywords?.length) {
      toast({
        title: "Validation Error",
        description: "All fields are required and at least one keyword must be provided.",
        variant: "destructive"
      });
      return;
    }
    
    createFaq.mutate({
      topic: formState.topic,
      question: formState.question,
      answer: formState.answer,
      keywords: formState.keywords
    } as Omit<FAQ, 'id'>);
  };
  
  // Handle form submission for updating an FAQ
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFaq || !formState.topic || !formState.question || !formState.answer || !formState.keywords?.length) {
      toast({
        title: "Validation Error",
        description: "All fields are required and at least one keyword must be provided.",
        variant: "destructive"
      });
      return;
    }
    
    updateFaq.mutate({
      id: selectedFaq.id,
      topic: formState.topic,
      question: formState.question,
      answer: formState.answer,
      keywords: formState.keywords
    } as FAQ);
  };
  
  // Handle deletion of an FAQ
  const handleDelete = () => {
    if (selectedFaq) {
      deleteFaq.mutate(selectedFaq.id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="animate-spin w-8 h-8 text-gray-400" />
        <span className="ml-2 text-lg">Loading FAQ data...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-500 mb-4">Failed to load FAQ data</div>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">FAQ Administrator</CardTitle>
          <CardDescription>
            Manage the FAQ content that powers the customer support chatbot.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">FAQ Content</h2>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New FAQ
            </Button>
          </div>
          
          {topics.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-gray-500">No FAQs available. Click "Add New FAQ" to create your first FAQ.</p>
            </div>
          ) : (
            <Tabs 
              defaultValue={topics[0]} 
              value={selectedTopic}
              onValueChange={setSelectedTopic}
              className="w-full"
            >
              <TabsList className="mb-4 w-full flex overflow-x-auto">
                {topics.map((topic) => (
                  <TabsTrigger key={topic} value={topic} className="flex-grow">
                    {topic}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {topics.map((topic) => (
                <TabsContent key={topic} value={topic} className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {getFaqsByTopic(topic).map((faq: FAQ) => (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                        <div className="flex justify-between items-center">
                          <AccordionTrigger className="flex-1 text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <div className="flex space-x-2 mr-4">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(faq);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(faq);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent>
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-1">Answer:</h4>
                              <p className="whitespace-pre-wrap">{faq.answer}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Keywords:</h4>
                              <div className="flex flex-wrap gap-2">
                                {faq.keywords.map((keyword, idx) => (
                                  <span 
                                    key={idx} 
                                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      {/* Add FAQ Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="topic" className="text-right">Topic</Label>
                <Input
                  id="topic"
                  name="topic"
                  value={formState.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Shipping Policy"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="question" className="text-right">Question</Label>
                <Input
                  id="question"
                  name="question"
                  value={formState.question}
                  onChange={handleInputChange}
                  placeholder="e.g., How long does shipping take?"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="answer" className="text-right pt-2">Answer</Label>
                <Textarea
                  id="answer"
                  name="answer"
                  value={formState.answer}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed answer..."
                  className="col-span-3 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="keywords" className="text-right">Keywords</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex">
                    <Input
                      id="newKeyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="e.g., shipping, delivery"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="ml-2"
                      onClick={handleAddKeyword}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formState.keywords?.map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center"
                      >
                        {keyword}
                        <button
                          type="button"
                          className="ml-1 text-gray-500 hover:text-red-500"
                          onClick={() => handleRemoveKeyword(keyword)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={createFaq.isPending}
              >
                {createFaq.isPending && (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save FAQ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit FAQ Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-topic" className="text-right">Topic</Label>
                <Input
                  id="edit-topic"
                  name="topic"
                  value={formState.topic}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-question" className="text-right">Question</Label>
                <Input
                  id="edit-question"
                  name="question"
                  value={formState.question}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-answer" className="text-right pt-2">Answer</Label>
                <Textarea
                  id="edit-answer"
                  name="answer"
                  value={formState.answer}
                  onChange={handleInputChange}
                  className="col-span-3 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-keywords" className="text-right">Keywords</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex">
                    <Input
                      id="edit-newKeyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add a keyword"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="ml-2"
                      onClick={handleAddKeyword}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formState.keywords?.map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center"
                      >
                        {keyword}
                        <button
                          type="button"
                          className="ml-1 text-gray-500 hover:text-red-500"
                          onClick={() => handleRemoveKeyword(keyword)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={updateFaq.isPending}
              >
                {updateFaq.isPending && (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update FAQ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this FAQ?</p>
            {selectedFaq && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{selectedFaq.question}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteFaq.isPending}
            >
              {deleteFaq.isPending && (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}