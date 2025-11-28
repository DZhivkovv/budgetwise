export default (sequelize, Sequelize) => {
    // Define the Subcategory model with fields and validation rules
    const Subcategory = sequelize.define("subcategory", {
        // Primary key - Subcategory ID
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // Foreign Key - Category ID. 
        // References the category the subcategory belongs to.
        categoryId: {
            type: Sequelize.INTEGER, 
            allowNull: false, // A required field. Every subcategory should have a related category.
            unique: "uniqueSubcategoryPerCategory", // Unique subcategory per category
            references: {
                model: "categories",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        // Foreign Key - User ID.
        // References the user that created the subcategory. A user is allowed to make his own custom subcategories.  
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true, // Not a required field. A user can create his own subcategory but there are available pre-made subcategories. 
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE", // If a user account is deleted, all subcategories he created will be deleted too.
        },
        // Subcategory Name
        name: {
            type: Sequelize.STRING, 
            allowNull: false, // Every subcategory should have a name.
            unique: "uniqueSubcategoryPerCategory" // Unique subcategory per category
        },
    },
    {
        timestamps: true,
    },
);
    
    // Return the Subategory model to be used elsewhere in the app
    return Subcategory;
};