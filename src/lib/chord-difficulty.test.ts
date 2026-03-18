import { describe, it, expect } from "vitest";
import {
  calculateDifficulty,
  difficultyToColor,
  difficultyToLabel,
  difficultyToBackgroundColor,
  difficultyToBorderColor,
  formatBreakdown,
  type CanonicalChord,
} from "./chord-difficulty";

describe("calculateDifficulty", () => {
  describe("Em - Easiest chord", () => {
    const Em: CanonicalChord = {
      name: "Em",
      frets: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
    };

    it("should have a low difficulty score", () => {
      const result = calculateDifficulty(Em);
      expect(result.score).toBeLessThan(30);
    });

    it("should not detect a barre", () => {
      const result = calculateDifficulty(Em);
      expect(result.breakdown.barre).toBe(0);
    });

    it("should have open string bonus", () => {
      const result = calculateDifficulty(Em);
      expect(result.breakdown.openStringBonus).toBeLessThan(0);
    });
  });

  describe("C major - Intermediate chord", () => {
    const C: CanonicalChord = {
      name: "C",
      frets: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
    };

    it("should have a moderate difficulty score", () => {
      const result = calculateDifficulty(C);
      expect(result.score).toBeGreaterThan(10);
      expect(result.score).toBeLessThan(50);
    });

    it("should account for fret span", () => {
      const result = calculateDifficulty(C);
      expect(result.breakdown.fretSpan).toBeGreaterThan(0);
    });
  });

  describe("Am - Easy chord", () => {
    const Am: CanonicalChord = {
      name: "Am",
      frets: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
    };

    it("should have a low to moderate difficulty score", () => {
      const result = calculateDifficulty(Am);
      expect(result.score).toBeLessThan(35);
    });

    it("should have open string bonus", () => {
      const result = calculateDifficulty(Am);
      expect(result.breakdown.openStringBonus).toBeLessThan(0);
    });
  });

  describe("F major (barre) - Hard chord", () => {
    const F: CanonicalChord = {
      name: "F",
      frets: [1, 1, 2, 3, 3, 1],
      fingers: [1, 1, 2, 3, 4, 1],
    };

    it("should have a high difficulty score", () => {
      const result = calculateDifficulty(F);
      expect(result.score).toBeGreaterThan(40);
    });

    it("should detect a barre", () => {
      const result = calculateDifficulty(F);
      expect(result.breakdown.barre).toBeGreaterThan(0);
    });

    it("should have no open string bonus", () => {
      const result = calculateDifficulty(F);
      expect(result.breakdown.openStringBonus).toBeGreaterThanOrEqual(0);
    });
  });

  describe("F major (simplified without barre)", () => {
    const FSimple: CanonicalChord = {
      name: "F",
      frets: [-1, -1, 3, 2, 1, 1],
      fingers: [0, 0, 3, 2, 1, 1],
    };

    it("should have lower difficulty than full F barre", () => {
      const F: CanonicalChord = {
        name: "F",
        frets: [1, 1, 2, 3, 3, 1],
        fingers: [1, 1, 2, 3, 4, 1],
      };
      const fullF = calculateDifficulty(F);
      const simpleF = calculateDifficulty(FSimple);
      expect(simpleF.score).toBeLessThan(fullF.score);
    });
  });

  describe("G major", () => {
    const G: CanonicalChord = {
      name: "G",
      frets: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
    };

    it("should have moderate difficulty", () => {
      const result = calculateDifficulty(G);
      expect(result.score).toBeGreaterThan(5);
      expect(result.score).toBeLessThan(45);
    });
  });

  describe("Fallback mode (no fingers)", () => {
    const EmNoFingers: CanonicalChord = {
      name: "Em",
      frets: [0, 2, 2, 0, 0, 0],
    };

    it("should still calculate difficulty without fingers", () => {
      const result = calculateDifficulty(EmNoFingers);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("should detect potential barre without fingers", () => {
      const FNoFingers: CanonicalChord = {
        name: "F",
        frets: [1, 1, 2, 3, 3, 1],
      };
      const result = calculateDifficulty(FNoFingers);
      expect(result.breakdown.barre).toBeGreaterThan(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle all muted strings", () => {
      const muted: CanonicalChord = {
        name: "X",
        frets: [-1, -1, -1, -1, -1, -1],
      };
      const result = calculateDifficulty(muted);
      expect(result.score).toBe(0);
    });

    it("should handle all open strings", () => {
      const open: CanonicalChord = {
        name: "Open",
        frets: [0, 0, 0, 0, 0, 0],
      };
      const result = calculateDifficulty(open);
      expect(result.score).toBe(0);
      expect(result.breakdown.openStringBonus).toBeLessThan(0);
    });

    it("should clamp score to 0-100 range", () => {
      const extreme: CanonicalChord = {
        name: "Extreme",
        frets: [1, 5, 9, 12, 7, 3],
        fingers: [1, 2, 3, 4, 3, 2],
      };
      const result = calculateDifficulty(extreme);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Difficulty ordering", () => {
    it("should rank Em easier than C", () => {
      const Em: CanonicalChord = {
        name: "Em",
        frets: [0, 2, 2, 0, 0, 0],
        fingers: [0, 2, 3, 0, 0, 0],
      };
      const C: CanonicalChord = {
        name: "C",
        frets: [-1, 3, 2, 0, 1, 0],
        fingers: [0, 3, 2, 0, 1, 0],
      };
      expect(calculateDifficulty(Em).score).toBeLessThan(
        calculateDifficulty(C).score
      );
    });

    it("should rank Am easier than F", () => {
      const Am: CanonicalChord = {
        name: "Am",
        frets: [-1, 0, 2, 2, 1, 0],
        fingers: [0, 0, 2, 3, 1, 0],
      };
      const F: CanonicalChord = {
        name: "F",
        frets: [1, 1, 2, 3, 3, 1],
        fingers: [1, 1, 2, 3, 4, 1],
      };
      expect(calculateDifficulty(Am).score).toBeLessThan(
        calculateDifficulty(F).score
      );
    });
  });
});

describe("difficultyToColor", () => {
  it("should return green for score 0", () => {
    const color = difficultyToColor(0);
    expect(color).toContain("hsl(120");
  });

  it("should return red for score 100", () => {
    const color = difficultyToColor(100);
    expect(color).toContain("hsl(0");
  });

  it("should return yellow-ish for score 50", () => {
    const color = difficultyToColor(50);
    expect(color).toContain("hsl(60");
  });

  it("should support alpha channel", () => {
    const color = difficultyToColor(50, 0.5);
    expect(color).toContain("hsla");
    expect(color).toContain("0.5");
  });

  it("should clamp scores outside 0-100", () => {
    const colorNegative = difficultyToColor(-10);
    const color0 = difficultyToColor(0);
    expect(colorNegative).toBe(color0);

    const color150 = difficultyToColor(150);
    const color100 = difficultyToColor(100);
    expect(color150).toBe(color100);
  });
});

describe("difficultyToLabel", () => {
  it("should return 'Très facile' for score < 20", () => {
    expect(difficultyToLabel(10)).toBe("Très facile");
    expect(difficultyToLabel(0)).toBe("Très facile");
  });

  it("should return 'Facile' for score 20-39", () => {
    expect(difficultyToLabel(20)).toBe("Facile");
    expect(difficultyToLabel(39)).toBe("Facile");
  });

  it("should return 'Moyen' for score 40-59", () => {
    expect(difficultyToLabel(40)).toBe("Moyen");
    expect(difficultyToLabel(59)).toBe("Moyen");
  });

  it("should return 'Difficile' for score 60-79", () => {
    expect(difficultyToLabel(60)).toBe("Difficile");
    expect(difficultyToLabel(79)).toBe("Difficile");
  });

  it("should return 'Très difficile' for score >= 80", () => {
    expect(difficultyToLabel(80)).toBe("Très difficile");
    expect(difficultyToLabel(100)).toBe("Très difficile");
  });
});

describe("difficultyToBackgroundColor", () => {
  it("should return a light HSL color", () => {
    const color = difficultyToBackgroundColor(50);
    expect(color).toContain("95%");
  });
});

describe("difficultyToBorderColor", () => {
  it("should return a saturated HSL color", () => {
    const color = difficultyToBorderColor(50);
    expect(color).toContain("70%");
    expect(color).toContain("50%");
  });
});

describe("formatBreakdown", () => {
  it("should format breakdown as readable lines", () => {
    const Em: CanonicalChord = {
      name: "Em",
      frets: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
    };
    const result = calculateDifficulty(Em);
    const formatted = formatBreakdown(result.breakdown);

    expect(formatted).toContain("Total:");
    expect(formatted).toContain("Cordes à vide:");
  });

  it("should only include non-zero values", () => {
    const open: CanonicalChord = {
      name: "Open",
      frets: [0, 0, 0, 0, 0, 0],
    };
    const result = calculateDifficulty(open);
    const formatted = formatBreakdown(result.breakdown);

    expect(formatted).not.toContain("Barré:");
    expect(formatted).not.toContain("Étendue frettes:");
  });
});
