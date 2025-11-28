export default (sequelize, Sequelize) => {
    // Define the Category model with fields and validation rules
    const Category = sequelize.define("category", {
        // Primary key - Category ID.
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // Foreign Key - User ID. References the user that created a category.
        // A user is allowed to make his own custom categories.  
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true, 
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",  // If a user account is deleted, all categories he created will be deleted too.
        },
        // Category name.
        name: {
            type: Sequelize.STRING,
            allowNull: false, // Every category should have a name.
        },
    },
    {
        timestamps: true,
    },
);
    
    // Return the Category model to be used elsewhere in the app
    return Category;
};