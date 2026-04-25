import { Link } from "react-router-dom";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

const NotFound = () => {
  return (
    <PhoneFrame>
      <div className="h-full w-full flex flex-col items-center justify-center px-8 text-center bg-background">
        <div className="h-20 w-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow mb-6">
          <Compass className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Lost at sea</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          That route doesn't exist on the SeaPark map.
        </p>
        <Link to="/">
          <Button className="h-12 px-6 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            Back to map
          </Button>
        </Link>
      </div>
    </PhoneFrame>
  );
};

export default NotFound;
