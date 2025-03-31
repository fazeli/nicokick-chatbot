import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UserCog, MessageCircle } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-primary text-primary-foreground py-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Nicokick Support</div>
        
        <div className="flex gap-4">
          <Link href="/">
            <Button 
              variant={location === "/" ? "secondary" : "ghost"} 
              className="flex items-center"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chatbot
            </Button>
          </Link>
          
          <Link href="/admin/faq">
            <Button 
              variant={location === "/admin/faq" ? "secondary" : "ghost"} 
              className="flex items-center"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}