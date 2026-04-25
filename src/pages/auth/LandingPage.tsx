import React from "react";
import { Navbar, Footer, HeroSection, HowItWorks, WhyUs } from "../../modules/auth/components/landing";


import "../../modules/auth/styles/landing.css"; 

const LandingPage = (): React.JSX.Element => {
  return (
    
    <div className="landing-page min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <WhyUs />
      <Footer />
    </div>
  );
}

export default LandingPage;