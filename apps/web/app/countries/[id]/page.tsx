"use client";

import { useParams } from 'next/navigation';
import { getCountryById } from "@/lib/api/countries";
import type { Country } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { countryFields } from "@/lib/fields/countries";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";

export default function ViewCountryPage() {
  const params = useParams();
  const countryId = params.id;

  const countryQuery = useApiQuery({
    queryKey: ['country', countryId],
    queryFn: () => getCountryById(Number(countryId)),
    enabled: !!countryId,
  });

  const result = queryGate(countryQuery);
  if (!result.ready) return result.gate;

  const [country] = result.data;

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
