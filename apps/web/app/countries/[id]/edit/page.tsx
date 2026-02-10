"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getCountryById } from "@/lib/api/countries";
import type { Country } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { countryFields } from "@/lib/fields/countries";
import { updateCountry } from "@/lib/api/countries";
import { ApiResult } from "@/lib/api/frontend";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

async function handleUpdate(country: Country): Promise<ApiResult<Country>> {
  console.log("Update country:", country);

  try {
    return updateCountry(country);
  } catch (err: any) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditCountryPage() {
  const params = useParams();
  const countryId = Number(params.id);

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ["country", countryId],
    queryFn: () => getCountryById(countryId),
    enabled: !!countryId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var country = queryResult.data;

  return (
    <section>
      <PageHeader title="Edit Country" />
      <GenericCard<Country>
        mode="edit"
        data={country}
        fields={countryFields}
        processSave={handleUpdate}
        redirectTo="/countries"
      />
    </section>
  );
}