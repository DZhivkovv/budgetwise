import validateRegistrationData from "../../utils/validation/validateRegistrationData.js";

describe('validateRegistrationData', () => {
   // ---------------- SUCCESSFUL TESTS ---------------------
    describe('Successful tests', () => {

        it('should accept when the first and last names are valid', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'john@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(true);
            expect(result.message).toBe("Registration data valid");
        });

        it('should accept when the email address is valid', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(true);
            expect(result.message).toBe("Registration data valid");
        });
        
        it('should accept when the email address is valid after trim', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: '   johndoe@gmail.com   ',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
            expect(result).toEqual({ valid: true, message: "Registration data valid" });
        });

        it('should accept when age is between 13 and 120', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 20,
                email: 'john@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(true);
            expect(result.message).toBe("Registration data valid");
        });

        it('should accept when age is exactly 13', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 13,
                email: 'john@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(true);
            expect(result.message).toBe("Registration data valid");
        });

        it('should accept when age is exactly 120', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 120,
                email: 'john@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(true);
            expect(result.message).toBe("Registration data valid");
        });

      it('should accept when age is a numeric string between 13 and 120', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: '20',
                email: 'john@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(true);
            expect(result.message).toBe("Registration data valid");
        });

        it('should accept password that meets all requirements', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'john@example.com',
                password: 'Aa1!aaaa',
                confirmPassword: 'Aa1!aaaa'
            });
            
            expect(result.valid).toBe(true);
            expect(result.message).toBe("Registration data valid");
        });

    });

   // ---------------- VALIDATION ERRORS ---------------------
    describe('Validation errors', () => {
        describe('Invalid names', () => {
            it('should reject when first name is a number', () => {
                const result = validateRegistrationData({
                    firstName: 25,
                    lastName: 'Doe',
                    age: 25,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");
            });

            it('should reject when last name is a number', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 25,
                    age: 25,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");
            });

            it('should reject when first name is an empty string', () => {
                const result = validateRegistrationData({
                    firstName: '',
                    lastName: 'Doe',
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });
          
                expect(result.valid).toBe(false);
                expect(result.message).toBe("All fields are required!");
            });

            it('should reject when last name is an empty string', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: '',
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });
                expect(result).toEqual({ valid: false, message: "All fields are required!" });
            });
  
            it('should reject when first name is undefined', () => {
                const result = validateRegistrationData({
                    firstName: undefined,
                    lastName: 'Doe',
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                
            });

            it('should reject when last name is undefined', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: undefined,
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                
            });            

            it('should reject when first name is null', () => {
                const result = validateRegistrationData({
                    firstName: null,
                    lastName: 'Doe',
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                
            });

            it('should reject when last name is null', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: null,
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                
            });      
            
            it('should reject when first name is an empty object', () => {
                const result = validateRegistrationData({
                    firstName: {},
                    lastName: 'Doe',
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                            
            });

            it('should reject when last name is an empty object', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: {},
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });
                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                            
            });  
            
            it('should reject when first name is only whitespace', () => {
                const result = validateRegistrationData({
                    firstName: '   ',
                    lastName: 'Doe',
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("All fields are required!");                            
            });

            it('should reject when last name is only whitespace', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: '   ',
                    age: 25,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("All fields are required!");                            
            });
        });

        describe('Invalid password', () => {

        it('should reject when password is under 8 characters', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'john@example.com',
                password: 'a123!',
                confirmPassword: 'a123!'
            });
            expect(result.valid).toBe(false);
            expect(result.message).toBe("Password must be at least 8 chars and include uppercase, lowercase, number, and special character." );                            
        });

        it('should reject when password does not have a digit character', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'john@example.com',
                password: 'Passwordddd!',
                confirmPassword: 'Passwordddd!'
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("Password must be at least 8 chars and include uppercase, lowercase, number, and special character." );                            
        });

        it('should reject when password is missing an uppercase letter', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'john@example.com',
                password: 'password123!',
                confirmPassword: 'password123!'
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("Password must be at least 8 chars and include uppercase, lowercase, number, and special character." );                            

        });

        it('should reject when password is missing lowercase letter', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'john@example.com',
                password: 'PASSWORD123!',
                confirmPassword: 'PASSWORD123!'
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("Password must be at least 8 chars and include uppercase, lowercase, number, and special character." );                            

        });

        it('should reject when password is missing a special character', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'john@example.com',
                password: 'Password123',
                confirmPassword: 'Password123'
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("Password must be at least 8 chars and include uppercase, lowercase, number, and special character." );                            

        });

        it('should reject when the password is an empty string', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: '',
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(false);
            expect(result.message).toBe("All fields are required!");                            
        });

        it('should reject when confirm password is an empty string', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: 'Password123!',
                confirmPassword: ''
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("All fields are required!");                            
        });

        it('should reject when the password is undefined', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: undefined,
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(false);
            expect(result.message).toBe("Wrong field datatype!");                            
        });

        it('should reject when confirm password is undefined', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: 'Password123!',
                confirmPassword: undefined
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("Wrong field datatype!");                            
        });

        it('should reject when the password is null', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: 'Password123!',
                confirmPassword: null
            });
            expect(result.valid).toBe(false);
            expect(result.message).toBe("Wrong field datatype!");                            
        });

        it('should reject when confirm password is null', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: 'Password123!',
                confirmPassword: null
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("Wrong field datatype!");                            
        });

        it('should reject when the password is an empty object', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: {},
                confirmPassword: 'Password123!'
            });
            expect(result.valid).toBe(false);
            expect(result.message).toBe("Wrong field datatype!");                            
        });

        it('should reject when confirm password is an empty object', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: 'Password123!',
                confirmPassword: {}
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("Wrong field datatype!");                            
        });

        it('should reject when password and confirm password do not match', () => {
            const result = validateRegistrationData({
                firstName: 'John',
                lastName: 'Doe',
                age: 25,
                email: 'johndoe@gmail.com',
                password: 'Password123!',
                confirmPassword: 'Password1234!'
            });

            expect(result.valid).toBe(false);
            expect(result.message).toBe("Passwords do not match.");                            
        });
        });

        describe('Invalid email address', () => {

            it('should reject when the email is an empty string', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: '',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });
                
                expect(result.valid).toBe(false);
                expect(result.message).toBe("All fields are required!");                            
            });

            it('should reject when the email is invalid email address', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: 'john@domain',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });
                expect(result).toEqual({ valid: false, message: "Invalid email address." });
            });

            it('should reject when the email is a number', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: 12345,
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                            
            });

            it('should reject when the email is undefined', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: undefined,
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                            
            });

            it('should reject when the email is null', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: null,
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                            
            });

            it('should reject when the email is an empty object', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 25,
                    email: {},
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");                            
            });
        });

        describe('Invalid age', () => {

            it('should reject when the age is under 13', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 12,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Your age must be a whole number between 13 and 120!");                            
            });

            it('should reject when the age is above 120', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 121,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Your age must be a whole number between 13 and 120!");                            
            });

            it('should reject when the age is a non-numeric string', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 'not an age',
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");  
            });

            it('should reject when the age is a floating number', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: 13.5,
                    email: 'john@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Your age must be a whole number between 13 and 120!");                                            
            });        

            it('should reject when the age is an empty string', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: '',
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("All fields are required!");       
            });

            it('should reject when the age is undefined', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: undefined,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");       
            });

            it('should reject when the age is null', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: null,
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("All fields are required!");       
            });

            it('should reject when the age is an empty object', () => {
                const result = validateRegistrationData({
                    firstName: 'John',
                    lastName: 'Doe',
                    age: {},
                    email: 'johndoe@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

                expect(result.valid).toBe(false);
                expect(result.message).toBe("Wrong field datatype!");     
            });
        });
    });






   

});
