import Home from '../page';

export default Home;

export async function generateStaticParams() {
  const countries = ['global', 'us', 'uk', 'in'];
  return countries.map((country) => ({
    country: country,
  }));
}
