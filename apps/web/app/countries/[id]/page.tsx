"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getCountryById } from "@/lib/api/countries";
import type { Country } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { countryFields } from "@/lib/fields/countries";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function ViewCountryPage() {
  const params = useParams();
  const countryId = params.id;

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ['country', countryId],
    queryFn: () => getCountryById(Number(countryId)), 
    enabled: !!countryId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var country = queryResult.data;

  return (
    <section>
      <PageHeader title={`View Country - ${country.name}`} />
      <GenericCard<Country>
        mode="view"
        data={country}
        fields={countryFields}
      />
    </section>
  );
}
