import Navigation from "@/components/Navigation";
import OwnerDashboard from "@/components/OwnerDashboard";

const Owner = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <OwnerDashboard />
      </div>
    </div>
  );
};

export default Owner;