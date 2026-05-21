import Hero from '../components/Hero';
import HomeCards from '../components/HomeCards';
import JobListings from '../components/ViewAllJobs';

const HomePage = () => {
  return (
    <>
        <Hero />
        <HomeCards />
        <JobListings />
        <ViewsAllJobs />
    </>
  );
};

export default HomePage;
