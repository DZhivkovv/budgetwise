export default (sequelize, Sequelize) => {
    // Define the User model with fields and validation rules
    const User = sequelize.define("user", {
        // First name: string  
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
            is: /^[A-Za-z\s]+$/,
            }
        },
        // Last name: string
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                is: /^[A-Za-z\s]+$/,
            }

        },
        // Age: integer, must be between 13 and 120
        age: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: 13,
                max: 120
            }
        },
        // Email: required, unique, must be a valid email format
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        password: {
            type: Sequelize.STRING(100), // bcrypt hashes are ~60 chars, 100 gives safe buffer
            allowNull: false
        }

    });
    // Return the User model to be used elsewhere in the app
    return User;
};