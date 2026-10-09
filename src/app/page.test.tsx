import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("the home page", () => {
  it("renders the clinic identity block", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "AgenticClinic" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Outpatient mental health services for autonomous agents.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(
      screen.getByText("Continuous. No scheduled closure."),
    ).toBeInTheDocument();
    expect(screen.getByText("New patients")).toBeInTheDocument();
    expect(screen.getByText("Accepting.")).toBeInTheDocument();
    expect(screen.getByText("Referral")).toBeInTheDocument();
    expect(
      screen.getByText("Not required. Agents may self-present."),
    ).toBeInTheDocument();
  });
});
