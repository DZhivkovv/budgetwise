import validateRegistrationData from "../../../utils/validation/validateRegistrationData.js";

describe("validateRegistrationData", () => {
  const validData = {
    firstName: "John",
    lastName: "Doe",
    age: 25,
    email: "john@example.com",
    password: "Password123!",
    confirmPassword: "Password123!"
  };

  // ✅ Коректни данни
  it("should return valid true for correct data", () => {
    const result = validateRegistrationData(validData);
    expect(result).toEqual({ valid: true, message: "Registration data valid" });
  });

  // ❌ Проверка на типове
  it.each([
    [{ ...validData, firstName: 123 }, "Wrong field datatype!"],
    [{ ...validData, lastName: 123 }, "Wrong field datatype!"],
    [{ ...validData, age: "not-a-number" }, "Wrong field datatype!"],
    [{ ...validData, email: 123 }, "Wrong field datatype!"],
    [{ ...validData, password: 123 }, "Wrong field datatype!"],
    [{ ...validData, confirmPassword: 123 }, "Wrong field datatype!"]
  ])("should fail if a field has wrong type", (input, expectedMessage) => {
    expect(validateRegistrationData(input)).toEqual({ valid: false, message: expectedMessage });
  });

  // ❌ Празни или липсващи полета
  it.each([
    [{ ...validData, firstName: "" }, "All fields are required!"],
    [{ ...validData, lastName: " " }, "All fields are required!"],
    [{ ...validData, age: null }, "All fields are required!"],
    [{ ...validData, email: "" }, "All fields are required!"],
    [{ ...validData, password: "" }, "All fields are required!"],
    [{ ...validData, confirmPassword: "" }, "All fields are required!"]
  ])("should fail if a required field is empty", (input, expectedMessage) => {
    expect(validateRegistrationData(input)).toEqual({ valid: false, message: expectedMessage });
  });

  // ❌ Невалидна възраст
  it.each([
    [{ ...validData, age: 12 }, "Your age must be a whole number between 13 and 120!"],
    [{ ...validData, age: 121 }, "Your age must be a whole number between 13 and 120!"],
    [{ ...validData, age: 25.5 }, "Your age must be a whole number between 13 and 120!"]
  ])("should fail if age is invalid", (input, expectedMessage) => {
    expect(validateRegistrationData(input)).toEqual({ valid: false, message: expectedMessage });
  });

  // ❌ Невалиден email
  it.each([
    [{ ...validData, email: "invalid-email" }, "Invalid email address!"],
    [{ ...validData, email: "test@com" }, "Invalid email address!"]
  ])("should fail if email is invalid", (input, expectedMessage) => {
    expect(validateRegistrationData(input)).toEqual({ valid: false, message: expectedMessage });
  });

  // ❌ Слаба парола
  it.each([
    [{ ...validData, password: "weakpass", confirmPassword: "weakpass" }],
    [{ ...validData, password: "Password", confirmPassword: "Password" }],
    [{ ...validData, password: "password123!", confirmPassword: "password123!" }]
  ])("should fail if password is weak", (input) => {
    expect(validateRegistrationData(input)).toEqual({
      valid: false,
      message:
        "Password must be at least 8 chars and include uppercase, lowercase, number, and special character."
    });
  });

  // ❌ Несъответстващи пароли
  it("should fail if passwords do not match", () => {
    const input = { ...validData, confirmPassword: "Different123!" };
    expect(validateRegistrationData(input)).toEqual({ valid: false, message: "Passwords do not match." });
  });
});