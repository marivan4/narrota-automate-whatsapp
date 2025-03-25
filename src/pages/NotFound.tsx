
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon, ArrowLeft, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Function to suggest a similar route
  const suggestSimilarRoute = (path: string) => {
    const routes = [
      "/dashboard",
      "/contracts",
      "/checklists",
      "/whatsapp-settings",
      "/users",
      "/settings",
      "/invoices"
    ];
    
    // Find closest match
    let bestMatch = "";
    let highestScore = 0;
    
    for (const route of routes) {
      // Simple scoring system - count matching characters
      let score = 0;
      const pathLower = path.toLowerCase();
      const routeLower = route.toLowerCase();
      
      // Exact segments get higher scores
      const pathSegments = pathLower.split('/').filter(Boolean);
      const routeSegments = routeLower.split('/').filter(Boolean);
      
      // Check if any segment matches completely
      for (const pathSegment of pathSegments) {
        if (routeSegments.includes(pathSegment)) {
          score += 5;
        }
      }
      
      // Check for partial matches in segments
      for (const pathSegment of pathSegments) {
        for (const routeSegment of routeSegments) {
          if (routeSegment.includes(pathSegment) || pathSegment.includes(routeSegment)) {
            score += 2;
          }
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = route;
      }
    }
    
    return highestScore > 0 ? bestMatch : "/dashboard";
  };

  const suggestedRoute = suggestSimilarRoute(location.pathname);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
        <p className="text-gray-500 mb-8">
          A página <span className="font-mono bg-gray-100 p-1 rounded">{location.pathname}</span> não existe ou foi movida.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => navigate("/")}
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Ir para a página inicial
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a página anterior
          </Button>
          
          {suggestedRoute && suggestedRoute !== "/dashboard" && (
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => navigate(suggestedRoute)}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Ir para {suggestedRoute}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
