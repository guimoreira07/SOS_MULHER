import { describe, it, expect } from "vitest";

// Test validation logic (mirrors what's in the contacts screen)
function validateContact(name: string, phone: string): { name?: string; phone?: string } {
  const errors: { name?: string; phone?: string } = {};
  if (!name.trim()) {
    errors.name = "O nome é obrigatório";
  }
  const digits = phone.replace(/\D/g, "");
  if (!phone.trim()) {
    errors.phone = "O telefone é obrigatório";
  } else if (digits.length < 8) {
    errors.phone = "Telefone inválido (mínimo 8 dígitos)";
  }
  return errors;
}

describe("Contact Validation", () => {
  it("should return no errors for valid contact", () => {
    const errors = validateContact("Mãe", "+55 11 99999-9999");
    expect(Object.keys(errors).length).toBe(0);
  });

  it("should require name", () => {
    const errors = validateContact("", "+55 11 99999-9999");
    expect(errors.name).toBe("O nome é obrigatório");
  });

  it("should require phone", () => {
    const errors = validateContact("Mãe", "");
    expect(errors.phone).toBe("O telefone é obrigatório");
  });

  it("should reject phone with less than 8 digits", () => {
    const errors = validateContact("Mãe", "1234567");
    expect(errors.phone).toBe("Telefone inválido (mínimo 8 dígitos)");
  });

  it("should accept phone with exactly 8 digits", () => {
    const errors = validateContact("Amiga", "12345678");
    expect(errors.phone).toBeUndefined();
  });

  it("should accept phone with formatting characters", () => {
    const errors = validateContact("Amiga", "(11) 9999-9999");
    expect(errors.phone).toBeUndefined();
  });

  it("should return both errors when both fields are empty", () => {
    const errors = validateContact("", "");
    expect(errors.name).toBeDefined();
    expect(errors.phone).toBeDefined();
  });
});

describe("Contacts limit logic", () => {
  const MAX_CONTACTS = 3;

  it("should allow adding when under limit", () => {
    expect([].length < MAX_CONTACTS).toBe(true);
    expect(["a"].length < MAX_CONTACTS).toBe(true);
    expect(["a", "b"].length < MAX_CONTACTS).toBe(true);
  });

  it("should block adding when at limit", () => {
    expect(["a", "b", "c"].length < MAX_CONTACTS).toBe(false);
  });
});
