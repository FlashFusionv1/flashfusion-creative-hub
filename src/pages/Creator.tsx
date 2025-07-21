import Navigation from "@/components/Navigation";
import CreatorDashboard from "@/components/CreatorDashboard";

const Creator = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <CreatorDashboard />
      </div>
    </div>
  );
};

export default Creator;