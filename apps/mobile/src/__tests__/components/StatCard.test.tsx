import { render, screen } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { StatCard } from "@/components/dashboard/StatCard";

function renderStatCard(props: {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}) {
  return render(
    <PaperProvider>
      <StatCard {...props} />
    </PaperProvider>,
  );
}

describe("StatCard", () => {
  it("renders title, value, and subtitle", () => {
    renderStatCard({
      title: "Bottles Stored",
      value: 42,
      subtitle: "in cellar",
      color: "#5D1D2E",
    });

    expect(screen.getByText("Bottles Stored")).toBeTruthy();
    expect(screen.getByText("42")).toBeTruthy();
    expect(screen.getByText("in cellar")).toBeTruthy();
  });

  it("renders string values", () => {
    renderStatCard({
      title: "Cellar Value",
      value: "$1,234",
      subtitle: "purchase price",
      color: "#2E8B57",
    });

    expect(screen.getByText("$1,234")).toBeTruthy();
  });
});
