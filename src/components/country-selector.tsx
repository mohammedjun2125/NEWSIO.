'use client';

import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const countries = [
  { value: 'global', label: 'Global' },
  { value: 'us', label: 'US' },
  { value: 'uk', label: 'UK' },
  { value: 'in', label: 'India' },
];

type CountrySelectorProps = {
  currentCountry: string;
};

export function CountrySelector({ currentCountry }: CountrySelectorProps) {

  return (
    <Tabs value={currentCountry} className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-4">
        {countries.map((country) => (
          <TabsTrigger value={country.value} asChild key={country.value}>
            <Link href={`/${country.value === 'global' ? '' : country.value}`}>{country.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
