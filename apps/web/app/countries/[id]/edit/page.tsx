"use client";

import { useParams } from "next/navigation";
import { getCountryById } from "@/lib/api/countries";
import type { Country } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { countryFields } from "@/lib/fields/countries";
import { updateCountry } from "@/lib/api/countries";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

async function handleUpdate(country: Country): Promise<ApiResult<Country>> {
  console.log("Update country:", country);

  try {
    return updateCountry(country);
  } catch (err: unknown) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditCountryPage() {
  const params = useParams();
  const countryId = Number(params.id);

  const countryQuery = useApiQuery({
    queryKey: ["country", countryId],
    queryFn: () => getCountryById(countryId),
    enabled: !!countryId,
  });

  const result = queryGate(countryQuery);
  if (!result.ready) return result.gate;

  const [country] = result.data;

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
