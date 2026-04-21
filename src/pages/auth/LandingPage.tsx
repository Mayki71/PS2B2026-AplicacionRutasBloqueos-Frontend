import { Navbar, Footer, HeroSection, HowItWorks, WhyUs} from "../../modules/auth/components/landing";

const LandingPage = (): React.JSX.Element => {
    return (
    <>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <WhyUs />
      <Footer />
    </>
  );
}

export default LandingPage;